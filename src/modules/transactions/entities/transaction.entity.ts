import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Station } from '../../stations/entities/station.entity';
import { Attendant } from '../../attendants/entities/attendant.entity';

export enum PaymentMethod {
  CASH = 'cash',
  MOMO = 'momo',
}

// Add FuelType enum
export enum FuelType {
  PETROL = 'petrol',
  DIESEL = 'diesel',
  PREMIUM = 'premium',
  ELECTRIC = 'electric',
}

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
    enum: FuelType,
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
