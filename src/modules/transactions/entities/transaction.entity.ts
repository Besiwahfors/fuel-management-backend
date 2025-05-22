import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'; // <--- Import JoinColumn
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

  // --- REVISED: Add explicit JoinColumn and foreign key column ---
  @ManyToOne(() => Station, (station) => station.transactions)
  @JoinColumn({ name: 'stationId' }) // Tells TypeORM that 'stationId' is the foreign key column
  station: Station;

  @Column({ nullable: true }) // Define the foreign key column itself, allow nullable if a transaction can exist without a station
  stationId: number;
  // --- END REVISED ---

  @ManyToOne(() => Attendant)
  @JoinColumn({ name: 'attendantId' }) // Recommended to add for attendant too
  attendant: Attendant;

  @Column({ nullable: true }) // Define the foreign key for attendant
  attendantId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED,
  })
  status: TransactionStatus;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;
}
