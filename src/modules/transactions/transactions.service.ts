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
import { FUEL_TYPES } from './fuel-types.constants';

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
    createDto: CreateTransactionDto,
    userId: number,
  ): Promise<Transaction> {
    const [user, station, attendant] = await Promise.all([
      this.usersRepository.findOneBy({ id: userId }),
      this.stationsRepository.findOneBy({ id: createDto.stationId }),
      this.attendantsRepository.findOneBy({ id: createDto.attendantId }),
    ]);

    if (!user || !station || !attendant) {
      throw new NotFoundException('One or more entities not found');
    }

    return this.transactionsRepository.save({
      ...createDto,
      fuelType: createDto.fuelType.toLowerCase() as (typeof FUEL_TYPES)[number], // Convert to lowercase here and cast to FuelType
      user,
      station,
      attendant,
    });
  }

  findAll(paymentMethod?: PaymentMethod) {
    return this.transactionsRepository.find({
      where: paymentMethod ? { paymentMethod } : {},
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
    const transactions = await this.getTransactionsInRange(dateRange);

    const initialFuelState = FUEL_TYPES.reduce(
      (acc, type) => ({
        ...acc,
        [type]: { totalAmount: 0, totalQuantity: 0 },
      }),
      {},
    );

    const breakdowns = transactions.reduce(
      ({ fuel, payment }, t) => ({
        fuel: {
          ...fuel,
          [t.fuelType]: {
            totalAmount: fuel[t.fuelType].totalAmount + Number(t.amount),
            totalQuantity: fuel[t.fuelType].totalQuantity + Number(t.liters),
          },
        },
        payment: {
          ...payment,
          [t.paymentMethod]: (payment[t.paymentMethod] || 0) + Number(t.amount),
        },
      }),
      { fuel: initialFuelState, payment: {} },
    );

    return {
      totalSales: transactions.reduce((sum, t) => sum + Number(t.amount), 0),
      fuelTypeBreakdown: breakdowns.fuel,
      paymentMethodBreakdown: breakdowns.payment,
      transactionCount: transactions.length,
      ...dateRange,
    };
  }

  async getFuelTypeReport(dateRange: DateRangeDto) {
    const rawData = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .select('transaction.fuelType', 'fuelType')
      .addSelect('SUM(transaction.amount)', 'totalAmount')
      .addSelect('SUM(transaction.quantity)', 'totalQuantity')
      .where('transaction.createdAt BETWEEN :start AND :end', dateRange)
      .groupBy('transaction.fuelType')
      .getRawMany();

    return FUEL_TYPES.map((type) => {
      const found = rawData.find((d) => d.fuelType === type);
      return found
        ? {
            fuelType: type,
            totalAmount: Number(found.totalAmount),
            totalQuantity: Number(found.totalQuantity),
          }
        : {
            fuelType: type,
            totalAmount: 0,
            totalQuantity: 0,
          };
    });
  }

  private async getTransactionsInRange(dateRange: DateRangeDto) {
    const startDate = dateRange.startDate
      ? new Date(dateRange.startDate)
      : undefined;
    const endDate = dateRange.endDate ? new Date(dateRange.endDate) : undefined;

    const whereClause: any = {};
    if (startDate && endDate) {
      whereClause.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      whereClause.createdAt = startDate; // Or handle as needed
    } else if (endDate) {
      whereClause.createdAt = endDate; // Or handle as needed
    }

    return this.transactionsRepository.find({
      where: whereClause,
    });
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
