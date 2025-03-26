import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { User } from '../users/entities/user.entity';
import { Station } from '../stations/entities/station.entity';
import { Attendant } from '../attendants/entities/attendant.entity';
import { PaymentMethod } from './entities/transaction.entity';
import { DateRangeDto } from './dto/date-range.dto';
import { FuelType } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Station)
    private stationsRepository: Repository<Station>,
    @InjectRepository(Attendant)
    private attendantsRepository: Repository<Attendant>,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    userId: number,
  ): Promise<Transaction> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    const station = await this.stationsRepository.findOneBy({
      id: createTransactionDto.stationId,
    });
    const attendant = await this.attendantsRepository.findOneBy({
      id: createTransactionDto.attendantId,
    });

    if (!user) throw new NotFoundException('User not found');
    if (!station) throw new NotFoundException('Station not found');
    if (!attendant) throw new NotFoundException('Attendant not found');

    const transaction = this.transactionsRepository.create({
      ...createTransactionDto,
      user,
      station,
      attendant,
    });

    return this.transactionsRepository.save(transaction);
  }

  findAll(paymentMethod?: PaymentMethod) {
    const where = paymentMethod ? { paymentMethod } : {};
    return this.transactionsRepository.find({
      where,
      relations: ['user', 'station', 'attendant'],
    });
  }

  findOne(id: number) {
    return this.transactionsRepository.findOne({
      where: { id },
      relations: ['user', 'station', 'attendant'],
    });
  }

  async generateReport(dateRange: DateRangeDto) {
    const where: any = {};

    if (dateRange.startDate && dateRange.endDate) {
      where.createdAt = Between(
        new Date(dateRange.startDate),
        new Date(dateRange.endDate),
      );
    }

    const transactions = await this.transactionsRepository.find({ where });

    const totalSales = transactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );

    // Add fuel type breakdown
    const fuelTypeBreakdown = transactions.reduce(
      (acc, t) => {
        const key = t.fuelType;
        acc[key] = acc[key] || { totalAmount: 0, totalQuantity: 0 };
        acc[key].totalAmount += Number(t.amount);
        acc[key].totalQuantity += Number(t.quantity);
        return acc;
      },
      {} as Record<FuelType, { totalAmount: number; totalQuantity: number }>,
    );

    const paymentMethodBreakdown = transactions.reduce(
      (acc, t) => {
        acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + Number(t.amount);
        return acc;
      },
      {} as Record<PaymentMethod, number>,
    );

    return {
      totalSales,
      fuelTypeBreakdown,
      paymentMethodBreakdown,
      transactionCount: transactions.length,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };
  }
  // Add new method for fuel type specific reports
  async getFuelTypeReport(dateRange: DateRangeDto) {
    return this.transactionsRepository
      .createQueryBuilder('transaction')
      .select('transaction.fuelType', 'fuelType')
      .addSelect('SUM(transaction.amount)', 'totalAmount')
      .addSelect('SUM(transaction.quantity)', 'totalQuantity')
      .where('transaction.createdAt BETWEEN :start AND :end', {
        start: dateRange.startDate,
        end: dateRange.endDate,
      })
      .groupBy('transaction.fuelType')
      .getRawMany();
  }

  findByStation(stationId: number) {
    return this.transactionsRepository.find({
      where: { station: { id: stationId } },
      relations: ['user', 'station', 'attendant'],
    });
  }

  findByAttendant(attendantId: number) {
    return this.transactionsRepository.find({
      where: { attendant: { id: attendantId } },
      relations: ['user', 'station', 'attendant'],
    });
  }
}
