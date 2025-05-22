import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Transaction, TransactionStatus } from './entities/transaction.entity';
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
    try {
      const [user, station, attendant] = await Promise.all([
        this.usersRepository.findOneBy({ id: userId }),
        this.stationsRepository.findOneBy({ id: createDto.stationId }),
        this.attendantsRepository.findOneBy({ id: createDto.attendantId }),
      ]);

      if (!user || !station || !attendant) {
        throw new NotFoundException('One or more entities not found');
      }

      const transaction = this.transactionsRepository.create({
        ...createDto,
        fuelType:
          createDto.fuelType.toLowerCase() as (typeof FUEL_TYPES)[number],
        user,
        station,
        attendant,
        status: createDto.status || TransactionStatus.COMPLETED,
      });

      return await this.transactionsRepository.save(transaction);
    } catch (error: any) {
      // Create a failed transaction record if something goes wrong
      // Explicitly define properties for TypeORM's create method
      const failedTransaction = this.transactionsRepository.create({
        amount: createDto.amount,
        liters: createDto.liters,
        paymentMethod: createDto.paymentMethod,
        fuelType:
          createDto.fuelType.toLowerCase() as (typeof FUEL_TYPES)[number],
        user: { id: userId }, // Provide partial user object with ID
        station: { id: createDto.stationId }, // Provide partial station object with ID
        attendant: { id: createDto.attendantId }, // Provide partial attendant object with ID
        status: TransactionStatus.FAILED,
        errorMessage:
          error.message ||
          'An unknown error occurred during transaction creation.',
      });

      await this.transactionsRepository.save(failedTransaction);
      throw error;
    }
  }

  findAll(paymentMethod?: PaymentMethod, status?: TransactionStatus) {
    const where: any = {};
    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }
    if (status) {
      where.status = status;
    }
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

    const recentTransactions = transactions
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 10);

    return {
      totalSales: transactions.reduce((sum, t) => sum + Number(t.amount), 0),
      fuelTypeBreakdown: Object.keys(breakdowns.fuel).map((fuelType) => ({
        fuelType: fuelType,
        amount: breakdowns.fuel[fuelType].totalAmount,
        quantity: breakdowns.fuel[fuelType].totalQuantity,
      })),
      paymentMethodBreakdown: Object.keys(breakdowns.payment).map((method) => ({
        method: method,
        count: breakdowns.payment[method],
      })),
      transactionCount: transactions.length,
      recentTransactions: recentTransactions.map((t) => ({
        id: t.id.toString(),
        amount: Number(t.amount),
        date: t.createdAt.toISOString().split('T')[0],
        method: t.paymentMethod,
      })),
      ...dateRange,
    };
  }

  async getFuelTypeReport(dateRange: DateRangeDto) {
    const rawData = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .select('transaction.fuelType', 'fuelType')
      .addSelect('SUM(transaction.amount)', 'totalAmount')
      .addSelect('SUM(transaction.quantity)', 'totalQuantity')
      .where('transaction.createdAt BETWEEN :start AND :end', {
        start: dateRange.startDate
          ? new Date(dateRange.startDate)
          : new Date(0),
        end: dateRange.endDate ? new Date(dateRange.endDate) : new Date(),
      })
      .groupBy('transaction.fuelType')
      .getRawMany();

    return FUEL_TYPES.map((type) => {
      const found = rawData.find((d: any) => d.fuelType === type);
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
    const where: any = {};

    if (dateRange.startDate || dateRange.endDate) {
      const startDate = dateRange.startDate
        ? new Date(dateRange.startDate)
        : undefined;
      const endDate = dateRange.endDate
        ? new Date(dateRange.endDate)
        : undefined;

      if (startDate) {
        startDate.setHours(0, 0, 0, 0);
      }
      if (endDate) {
        endDate.setHours(23, 59, 59, 999);
      }

      if (startDate && endDate) {
        where.createdAt = Between(startDate, endDate);
      } else if (startDate) {
        where.createdAt = MoreThanOrEqual(startDate);
      } else if (endDate) {
        where.createdAt = LessThanOrEqual(endDate);
      }
    }

    return this.transactionsRepository.find({
      where: where,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findByStation(stationId: number, status?: TransactionStatus) {
    const where: any = { station: { id: stationId } };
    if (status) {
      where.status = status;
    }
    return this.transactionsRepository.find({
      where,
      relations: ['user', 'station', 'attendant'],
    });
  }

  findByAttendant(attendantId: number, status?: TransactionStatus) {
    const where: any = { attendant: { id: attendantId } };
    if (status) {
      where.status = status;
    }
    return this.transactionsRepository.find({
      where,
      relations: ['user', 'station', 'attendant'],
    });
  }
}
