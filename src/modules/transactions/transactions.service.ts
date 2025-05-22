// src/modules/transactions/transactions.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import {
  Transaction,
  TransactionStatus,
  PaymentMethod,
  FuelType,
} from './entities/transaction.entity'; // Import FuelType enum
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { User } from '../users/entities/user.entity';
import { Station } from '../stations/entities/station.entity';
import { Attendant } from '../attendants/entities/attendant.entity';
import { DateRangeDto } from './dto/date-range.dto';

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
        throw new NotFoundException(
          'One or more entities not found (User, Station, or Attendant).',
        );
      }

      const transaction = this.transactionsRepository.create({
        ...createDto,
        fuelType: createDto.fuelType,
        user, // Assign the full user object
        station, // Assign the full station object
        attendant, // Assign the full attendant object
        status: createDto.status || TransactionStatus.COMPLETED,
      });

      return await this.transactionsRepository.save(transaction);
    } catch (error: any) {
      console.error('Error during transaction creation:', error.message); // Log the actual error

      // Create a failed transaction record if something goes wrong
      // Assign IDs directly to the foreign key columns instead of partial objects for relations
      const failedTransaction = this.transactionsRepository.create({
        amount: createDto.amount,
        liters: createDto.liters,
        paymentMethod: createDto.paymentMethod,
        fuelType: createDto.fuelType,
        // Assign IDs directly to the foreign key columns
        userId: userId, // Assuming userId is available even if user lookup failed
        stationId: createDto.stationId, // Assuming stationId is available
        attendantId: createDto.attendantId, // Assuming attendantId is available
        status: TransactionStatus.FAILED,
        errorMessage:
          error.message ||
          'An unknown error occurred during transaction creation.',
        // You might also want to explicitly set createdAt here if you want it distinct from the actual transaction
        // createdAt: new Date(),
      });

      await this.transactionsRepository.save(failedTransaction);
      // Re-throw the error so the controller can handle it (e.g., return 500 status)
      throw error;
    }
  }

  // ... rest of your service methods remain the same ...
  findAll(
    paymentMethod?: PaymentMethod,
    status?: TransactionStatus,
    startDate?: string,
    endDate?: string,
  ): Promise<Transaction[]> {
    const where: any = {};
    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }
    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;

      if (start) {
        start.setHours(0, 0, 0, 0);
      }
      if (end) {
        end.setHours(23, 59, 59, 999);
      }

      if (start && end) {
        where.createdAt = Between(start, end);
      } else if (start) {
        where.createdAt = MoreThanOrEqual(start);
      } else if (end) {
        where.createdAt = LessThanOrEqual(end);
      }
    }

    return this.transactionsRepository.find({
      where,
      relations: ['user', 'station', 'attendant'],
    });
  }

  findOne(id: number): Promise<Transaction | null> {
    return this.transactionsRepository.findOne({
      where: { id },
      relations: ['user', 'station', 'attendant'],
    });
  }

  async generateReport(dateRange: DateRangeDto) {
    const transactions = await this.getTransactionsInRange(dateRange);

    const allFuelTypes = Object.values(FuelType);

    const initialFuelState: Record<
      FuelType,
      { totalAmount: number; totalQuantity: number }
    > = allFuelTypes.reduce(
      (acc, type) => ({
        ...acc,
        [type]: { totalAmount: 0, totalQuantity: 0 },
      }),
      {} as Record<FuelType, { totalAmount: number; totalQuantity: number }>,
    );

    const breakdowns = transactions.reduce(
      ({ fuel, payment }, t) => ({
        fuel: {
          ...fuel,
          [t.fuelType]: {
            totalAmount:
              (fuel[t.fuelType]?.totalAmount || 0) + Number(t.amount),
            totalQuantity:
              (fuel[t.fuelType]?.totalQuantity || 0) + Number(t.liters),
          },
        },
        payment: {
          ...payment,
          [t.paymentMethod]: (payment[t.paymentMethod] || 0) + Number(t.amount),
        },
      }),
      { fuel: initialFuelState, payment: {} as Record<PaymentMethod, number> },
    );

    const recentTransactions = transactions
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 10);

    return {
      totalSales: transactions.reduce((sum, t) => sum + Number(t.amount), 0),
      fuelTypeBreakdown: Object.keys(breakdowns.fuel).map((fuelTypeKey) => {
        const fuelType = fuelTypeKey as FuelType;
        return {
          fuelType: fuelType,
          amount: breakdowns.fuel[fuelType].totalAmount,
          quantity: breakdowns.fuel[fuelType].totalQuantity,
        };
      }),
      paymentMethodBreakdown: Object.keys(breakdowns.payment).map(
        (methodKey) => {
          const method = methodKey as PaymentMethod;
          return {
            method: method,
            count: breakdowns.payment[method],
          };
        },
      ),
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

    const allFuelTypes = Object.values(FuelType);

    return allFuelTypes.map((type) => {
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

  private async getTransactionsInRange(
    dateRange: DateRangeDto,
  ): Promise<Transaction[]> {
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

  findByStation(
    stationId: number,
    status?: TransactionStatus,
  ): Promise<Transaction[]> {
    const where: any = { station: { id: stationId } };
    if (status) {
      where.status = status;
    }
    return this.transactionsRepository.find({
      where,
      relations: ['user', 'station', 'attendant'],
    });
  }

  findByAttendant(
    attendantId: number,
    status?: TransactionStatus,
  ): Promise<Transaction[]> {
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
