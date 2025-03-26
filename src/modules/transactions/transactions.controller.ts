import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  UseGuards,
  Req,
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

  // Update create method:
  @Post()
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    return this.transactionsService.create(
      createTransactionDto,
      req.user['userId'],
    );
  }

  @Get()
  findAll(@Query('paymentMethod') paymentMethod?: PaymentMethod) {
    return this.transactionsService.findAll(paymentMethod);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(+id);
  }

  @Get('reports')
  generateReport(@Query() dateRange: DateRangeDto) {
    return this.transactionsService.generateReport(dateRange);
  }

  @Get('stations/:stationId')
  findByStation(@Param('stationId') stationId: string) {
    return this.transactionsService.findByStation(+stationId);
  }

  @Get('attendants/:attendantId')
  findByAttendant(@Param('attendantId') attendantId: string) {
    return this.transactionsService.findByAttendant(+attendantId);
  }
}
