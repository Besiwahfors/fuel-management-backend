import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn, // Added for consistency and good practice
  UpdateDateColumn, // Added for consistency and good practice
  JoinColumn, // Added for explicit foreign key
} from 'typeorm';
import { Station } from '../../stations/entities/station.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity()
export class Attendant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  // Optional: Add contactNumber and email if they are part of the Attendant entity
  @Column({ nullable: true })
  contactNumber?: string;

  @Column({ nullable: true })
  email?: string;

  @OneToMany(() => Transaction, (transaction) => transaction.attendant)
  transactions: Transaction[]; // This will automatically load transactions when relations are eager-loaded

  @CreateDateColumn()
  createdAt: Date; // Keep this consistent for audit trails

  @UpdateDateColumn() // Added for consistency and good practice
  updatedAt: Date;

  @ManyToOne(() => Station, (station) => station.attendants, { nullable: true })
  @JoinColumn({ name: 'stationId' }) // Explicitly define the foreign key column
  station: Station | null;

  @Column({ nullable: true }) // Define the foreign key column itself
  stationId: number | null; // This will hold the ID of the associated station
}
