import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Attendant } from '../../attendants/entities/attendant.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

// Define an enum for clarity, though string is also fine in DB
export enum StationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

@Entity()
export class Station {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  location: string;

  // Add the status column
  @Column({
    type: 'enum', // Use 'enum' type for predefined options
    enum: StationStatus,
    default: StationStatus.ACTIVE, // Set a default value
  })
  status: StationStatus; // Use the enum type here

  @OneToMany(() => Attendant, (attendant) => attendant.station)
  attendants: Attendant[];

  @OneToMany(() => Transaction, (transaction) => transaction.station)
  transactions: Transaction[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // Add an updatedAt column for better tracking
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date; // TypeORM will automatically update this on save
}
