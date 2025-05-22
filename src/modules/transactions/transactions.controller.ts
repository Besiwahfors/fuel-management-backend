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
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Req() req: Request,
  ) {
    const user = this.validateUser(req);
    try {
      return await this.transactionsService.create(
        createTransactionDto,
        user.userId,
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
    this.validateAdmin(req);
    return this.transactionsService.generateReport(dateRange);
  }

  @Get('reports/fuel-type') // More specific route
  async getFuelTypeReport(
    @Query() dateRange: DateRangeDto,
    @Req() req: Request,
  ) {
    this.validateAdmin(req);
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
    this.validateAdmin(req);
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
    const user = this.validateUser(req);
    const id = this.parseId(attendantId, 'Attendant');

    if (user.role !== 'admin' && user.userId !== id) {
      throw new ForbiddenException(
        'Unauthorized to view attendant transactions',
      );
    }

    return this.transactionsService.findByAttendant(id, status);
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
    this.validateAdmin(req);
    return this.transactionsService.findAll(paymentMethod, status);
  }

  @Get(':id') // Wildcard ID route - MUST COME LAST AMONG GET ROUTES
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = this.validateUser(req);
    const transactionId = this.parseId(id, 'Transaction');

    if (user.role !== 'admin' && user.userId !== transactionId) {
      throw new ForbiddenException('Unauthorized to view this transaction');
    }

    return this.transactionsService.findOne(transactionId);
  }

  // === PRIVATE HELPER METHODS ===
  private validateAdmin(req: Request) {
    const user = req.user as JwtPayload;
    if (!user || user.role !== 'admin') {
      throw new ForbiddenException('Unauthorized access');
    }
  }

  private validateUser(req: Request): JwtPayload {
    const user = req.user as JwtPayload;
    if (!user || !user.userId) {
      throw new UnauthorizedException('Invalid authentication');
    }
    return user;
  }

  private parseId(id: string, entity: string): number {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      throw new BadRequestException(`Invalid ${entity} ID`);
    }
    return numId;
  }
}
