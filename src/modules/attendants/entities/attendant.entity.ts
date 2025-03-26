import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
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

  @ManyToOne(() => Station, (station) => station.attendants)
  station: Station;

  @OneToMany(() => Transaction, (transaction) => transaction.attendant)
  transactions: Transaction[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
