import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Attendant } from '../../attendants/entities/attendant.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity()
export class Station {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  location: string;

  @OneToMany(() => Attendant, (attendant) => attendant.station)
  attendants: Attendant[];

  @OneToMany(() => Transaction, (transaction) => transaction.station)
  transactions: Transaction[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
