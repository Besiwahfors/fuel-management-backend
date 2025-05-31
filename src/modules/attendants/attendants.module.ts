import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendant } from './entities/attendant.entity';
import { AttendantsService } from './attendants.service';
import { AttendantsController } from './attendants.controller';
import { Station } from '../stations/entities/station.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendant, Station, Transaction])],
  providers: [AttendantsService],
  controllers: [AttendantsController],
  exports: [AttendantsService],
})
export class AttendantsModule {}
