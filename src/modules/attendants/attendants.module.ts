import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendantsService } from './attendants.service';
import { AttendantsController } from './attendants.controller';
import { Attendant } from './entities/attendant.entity';
import { Station } from '../stations/entities/station.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendant, Station])],
  controllers: [AttendantsController],
  providers: [AttendantsService],
  exports: [AttendantsService],
})
export class AttendantsModule {}
