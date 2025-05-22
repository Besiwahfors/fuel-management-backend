// src/stations/stations.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Station } from './entities/station.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto'; // Make sure this is PartialType
import { Attendant } from '../../modules/attendants/entities/attendant.entity';

@Injectable()
export class StationsService {
  constructor(
    @InjectRepository(Station)
    private stationsRepository: Repository<Station>,
    @InjectRepository(Attendant)
    private attendantsRepository: Repository<Attendant>,
  ) {}

  async create(createStationDto: CreateStationDto): Promise<Station> {
    const station = this.stationsRepository.create(createStationDto);
    return this.stationsRepository.save(station);
  }

  findAll(): Promise<Station[]> {
    return this.stationsRepository.find({
      relations: ['attendants', 'transactions'],
    });
  }

  async findOne(id: number): Promise<Station> {
    const station = await this.stationsRepository.findOne({
      where: { id },
      relations: ['attendants', 'transactions'],
    });

    if (!station) {
      throw new NotFoundException(`Station with ID ${id} not found`);
    }
    return station;
  }

  // This method works for both PUT (full DTO) and PATCH (partial DTO)
  async update(
    id: number,
    updateStationDto: UpdateStationDto, // This DTO is now a PartialType
  ): Promise<Station> {
    const station = await this.findOne(id); // Find the existing station
    // This line merges existing data with new data from updateStationDto.
    // If updateStationDto only contains 'name', only 'name' will be updated.
    return this.stationsRepository.save({ ...station, ...updateStationDto });
  }

  async remove(id: number): Promise<void> {
    await this.stationsRepository.delete(id);
  }

  async addAttendant(
    stationId: number,
    attendantId: number,
  ): Promise<Attendant> {
    const station = await this.findOne(stationId);
    const attendant = await this.attendantsRepository.findOneBy({
      id: attendantId,
    });

    if (!attendant) {
      throw new NotFoundException(`Attendant with ID ${attendantId} not found`);
    }

    attendant.station = station;
    return this.attendantsRepository.save(attendant);
  }

  async removeAttendant(stationId: number, attendantId: number): Promise<void> {
    const attendant = await this.attendantsRepository.findOne({
      where: { id: attendantId, station: { id: stationId } },
    });

    if (!attendant) {
      throw new NotFoundException(
        `Attendant with ID ${attendantId} not found in station ${stationId}`,
      );
    }

    attendant.station = null; // Remove the station association

    await this.attendantsRepository.save(attendant);
  }
}
