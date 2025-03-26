import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationsService } from './stations.service';
import { StationsController } from './stations.controller';
import { Station } from './entities/station.entity';
import { Attendant } from '../attendants/entities/attendant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Station, Attendant])],
  controllers: [StationsController],
  providers: [StationsService],
  exports: [StationsService],
})
export class StationsModule {}
