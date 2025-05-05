import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Station } from '../../stations/entities/station.entity';
import { Attendant } from '../../attendants/entities/attendant.entity';
import { FUEL_TYPES } from '../fuel-types.constants';

export enum PaymentMethod {
  CASH = 'cash',
  MOMO = 'momo',
}

// Add FuelType enum
export type FuelType = (typeof FUEL_TYPES)[number];
export const FuelType = {
  PETROL: 'PETROL',
  DIESEL: 'DIESEL',
  PREMIUM: 'PREMIUM',

  ELECTRIC: 'ELECTRIC',
} as const;

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  // Add quantity field for liters/gallons
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  // Add fuel type column
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
}
