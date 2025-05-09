// src\modules\transactions\entities\transaction.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Station } from '../../stations/entities/station.entity';
import { Attendant } from '../../attendants/entities/attendant.entity';
import { FUEL_TYPES } from '../fuel-types.constants';

export enum PaymentMethod {
  CASH = 'cash',
  MOMO = 'momo',
}

export type FuelType = (typeof FUEL_TYPES)[number];
export const FuelType = {
  PETROL: 'petrol',
  DIESEL: 'diesel',
  PREMIUM: 'premium',
  ELECTRIC: 'electric',
} as const;

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

  @Column({
    type: 'enum',
    enum: FUEL_TYPES,
    nullable: false,
  })
  fuelType: FuelType;

  @ManyToOne(() => User, (user) => user.transactions)
  user: User;

  @ManyToOne(() => Station)
  station: Station;

  @ManyToOne(() => Attendant)
  attendant: Attendant;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED,
  })
  status: TransactionStatus;
}
