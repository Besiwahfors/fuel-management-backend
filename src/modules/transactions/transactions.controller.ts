import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  UseGuards,
  Req,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { DateRangeDto } from './dto/date-range.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import {
  PaymentMethod,
  TransactionStatus,
} from './entities/transaction.entity';
import { FUEL_TYPES } from './fuel-types.constants';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface'; // Ensure this is the updated interface
import { UserRole } from '../users/interfaces/user.interface'; // To use UserRole enum

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Req() req: Request,
  ) {
    // Only Attendants can create transactions
    const authenticatedEntity = this.validateAuthenticatedAttendant(req);
    try {
      // Pass the attendant's ID as the creator of the transaction
      return await this.transactionsService.create(
        createTransactionDto,
        authenticatedEntity.id,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  // === REPORTS ROUTES - MUST COME BEFORE :id ===
  @Get('reports') // Specific route
  generateReport(@Query() dateRange: DateRangeDto, @Req() req: Request) {
    this.validateAdminOrManager(req); // Only admins/managers should generate reports
    return this.transactionsService.generateReport(dateRange);
  }

  @Get('reports/fuel-type') // More specific route
  async getFuelTypeReport(
    @Query() dateRange: DateRangeDto,
    @Req() req: Request,
  ) {
    this.validateAdminOrManager(req); // Only admins/managers should generate reports
    const rawData = await this.transactionsService.getFuelTypeReport(dateRange);

    return rawData.map((item) => ({
      fuelType: item.fuelType.charAt(0) + item.fuelType.slice(1).toLowerCase(),
      totalAmount: Number(item.totalAmount),
      totalQuantity: Number(item.totalQuantity),
    }));
  }

  // === STATION & ATTENDANT SPECIFIC ROUTES - MUST COME BEFORE :id ===
  @Get('stations/:stationId')
  getTransactionsByStation(
    @Param('stationId') stationId: string,
    @Req() req: Request,
    @Query('status') status?: TransactionStatus,
  ) {
    this.validateAdminOrManager(req); // Only admins/managers can view by station
    return this.transactionsService.findByStation(
      this.parseId(stationId, 'Station'),
      status,
    );
  }

  @Get('attendants/:attendantId')
  getTransactionsByAttendant(
    @Param('attendantId') attendantId: string,
    @Req() req: Request,
    @Query('status') status?: TransactionStatus,
  ) {
    const authenticatedEntity = this.validateAuthenticatedEntity(req);
    const requestedAttendantId = this.parseId(attendantId, 'Attendant');

    // Security check: If not admin/manager, ensure the ID matches the authenticated attendant's ID
    if (
      // FIX: Added type casting for comparison
      (authenticatedEntity.role as UserRole) !== UserRole.ADMIN &&
      (authenticatedEntity.role as UserRole) !== UserRole.MANAGER &&
      authenticatedEntity.id !== requestedAttendantId
    ) {
      throw new ForbiddenException(
        'Unauthorized to view other attendant transactions',
      );
    }

    return this.transactionsService.findByAttendant(
      requestedAttendantId,
      status,
    );
  }

  // === GENERAL ROUTES ===
  @Get('fuel-types') // Specific route, could be above general ':id' or here
  getFuelTypes() {
    return { types: FUEL_TYPES };
  }

  @Get() // List all transactions (e.g., /transactions)
  findAll(
    @Req() req: Request,
    @Query('paymentMethod') paymentMethod?: PaymentMethod,
    @Query('status') status?: TransactionStatus,
  ) {
    this.validateAdminOrManager(req); // Only admins/managers can see all transactions
    return this.transactionsService.findAll(paymentMethod, status);
  }

  @Get(':id') // Wildcard ID route - MUST COME LAST AMONG GET ROUTES
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const authenticatedEntity = this.validateAuthenticatedEntity(req);
    const transactionId = this.parseId(id, 'Transaction');

    // Fetch the transaction first to get its associated attendant ID
    const transaction = await this.transactionsService.findOne(transactionId);
    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    // Security check:
    // 1. Admins/Managers can view any transaction.
    // 2. Attendants can only view transactions they created.
    if (
      // FIX: Added type casting for comparison
      (authenticatedEntity.role as UserRole) !== UserRole.ADMIN &&
      (authenticatedEntity.role as UserRole) !== UserRole.MANAGER
    ) {
      // If the authenticated entity is an Attendant, check if the transaction belongs to them
      if (
        // FIX: Added type casting for comparison
        (authenticatedEntity.role as UserRole) === UserRole.ATTENDANT &&
        transaction.attendant.id !== authenticatedEntity.id
      ) {
        throw new ForbiddenException('Unauthorized to view this transaction');
      } else {
        // If it's some other non-admin/non-manager role not covered, deny
        throw new ForbiddenException('Unauthorized access');
      }
    }

    return transaction;
  }

  // === PRIVATE HELPER METHODS ===

  // Validates if the authenticated entity is an Admin or Manager
  private validateAdminOrManager(req: Request) {
    const entity = req.user as JwtPayload;
    if (
      !entity ||
      // FIX: Added type casting for comparison
      ((entity.role as UserRole) !== UserRole.ADMIN &&
        (entity.role as UserRole) !== UserRole.MANAGER)
    ) {
      throw new ForbiddenException('Unauthorized access');
    }
  }

  // Validates if the authenticated entity is an Attendant
  private validateAuthenticatedAttendant(req: Request): JwtPayload {
    const entity = req.user as JwtPayload;
    if (!entity || (entity.role as UserRole) !== UserRole.ATTENDANT) {
      // FIX: Added type casting for comparison
      throw new UnauthorizedException(
        'Only attendants are authorized to perform this action.',
      );
    }
    return entity;
  }

  // General validation for any authenticated entity (admin, manager, attendant)
  private validateAuthenticatedEntity(req: Request): JwtPayload {
    const entity = req.user as JwtPayload;
    if (!entity || !entity.id || !entity.role) {
      throw new UnauthorizedException('Invalid authentication credentials.');
    }
    return entity;
  }

  private parseId(id: string, entity: string): number {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      throw new BadRequestException(`Invalid ${entity} ID`);
    }
    return numId;
  }
}
