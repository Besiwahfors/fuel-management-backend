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
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { DateRangeDto } from './dto/date-range.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { PaymentMethod } from './entities/transaction.entity';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Convert and validate user ID
    const userIdRaw = req.user['userId'];
    const userId =
      typeof userIdRaw === 'number' ? userIdRaw : Number(userIdRaw);
    if (isNaN(userId)) {
      throw new UnauthorizedException('Invalid user ID');
    }

    return this.transactionsService.create(createTransactionDto, userId);
  }

  @Get()
  findAll(
    @Req() req: Request,
    @Query('paymentMethod') paymentMethod?: PaymentMethod,
  ) {
    if (!req.user || req.user['role'] !== 'admin') {
      throw new ForbiddenException('Unauthorized to view all transactions');
    }
    return this.transactionsService.findAll(paymentMethod);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const transactionId = parseInt(id, 10);
    if (isNaN(transactionId)) {
      throw new BadRequestException('Invalid transaction ID');
    }

    // Safely extract and convert user ID
    const userIdRaw = req.user?.['userId'];
    const userId =
      typeof userIdRaw === 'number' ? userIdRaw : Number(userIdRaw);
    if (isNaN(userId)) {
      throw new UnauthorizedException('Invalid user ID');
    }

    if (
      !req.user ||
      (req.user['role'] !== 'admin' && userId !== transactionId)
    ) {
      throw new ForbiddenException('Unauthorized to view this transaction');
    }

    return this.transactionsService.findOne(transactionId);
  }

  @Get('reports')
  generateReport(@Query() dateRange: DateRangeDto, @Req() req: Request) {
    if (!req.user || req.user['role'] !== 'admin') {
      throw new ForbiddenException('Unauthorized to generate reports');
    }
    return this.transactionsService.generateReport(dateRange);
  }

  @Get('stations/:stationId')
  getTransactionsByStation(
    @Param('stationId') stationId: string,
    @Req() req: Request,
  ) {
    const stationIdNumber = parseInt(stationId, 10);
    if (isNaN(stationIdNumber)) {
      throw new BadRequestException('Invalid station ID');
    }
    if (!req.user || req.user['role'] !== 'admin') {
      throw new ForbiddenException('Unauthorized to view station transactions');
    }
    return this.transactionsService.findByStation(stationIdNumber);
  }

  @Get('attendants/:attendantId')
  getTransactionsByAttendant(
    @Param('attendantId') attendantId: string,
    @Req() req: Request,
  ) {
    const attendantIdNumber = parseInt(attendantId, 10);
    if (isNaN(attendantIdNumber)) {
      throw new BadRequestException('Invalid attendant ID');
    }
    const userId = Number(req.user?.['userId']);
    if (
      !req.user ||
      (req.user['role'] !== 'admin' && userId !== attendantIdNumber)
    ) {
      throw new ForbiddenException(
        'Unauthorized to view attendant transactions',
      );
    }
    return this.transactionsService.findByAttendant(attendantIdNumber);
  }
}
