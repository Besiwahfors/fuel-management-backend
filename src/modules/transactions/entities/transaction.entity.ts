// src/modules/transactions/entities/transaction.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Station } from '../../stations/entities/station.entity';
import { Attendant } from '../../attendants/entities/attendant.entity';

// Define PaymentMethod as a traditional enum (already correct)
export enum PaymentMethod {
  CASH = 'cash',
  MOMO = 'momo',
}

// **CRITICAL CHANGE: Define FuelType as a traditional TypeScript enum**
export enum FuelType {
  PETROL = 'petrol',
  DIESEL = 'diesel',
  PREMIUM = 'premium',
  ELECTRIC = 'electric',
}

// Define TransactionStatus as a traditional enum (already correct)
export enum TransactionStatus {
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'quantity' })
  liters: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  // Use the new FuelType enum
  @Column({
    type: 'enum',
    enum: FuelType, // Now refers to the enum value
    nullable: false,
  })
  fuelType: FuelType; // This is still the type for the property

  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => Station, (station) => station.transactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'stationId' })
  station: Station;

  @Column({ nullable: true })
  stationId: number;

  @ManyToOne(() => Attendant, (attendant) => attendant.transactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'attendantId' })
  attendant: Attendant;

  @Column({ nullable: true })
  attendantId: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  transactionDate: Date;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED,
  })
  status: TransactionStatus;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;
}
