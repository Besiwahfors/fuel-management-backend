import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.MANAGER })
  role: UserRole;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
