import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';
import { Station } from '../stations/entities/station.entity';
import { Attendant } from '../attendants/entities/attendant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, User, Station, Attendant])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
