import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendant } from './entities/attendant.entity';
import { CreateAttendantDto } from './dto/create-attendant.dto';
import { UpdateAttendantDto } from './dto/update-attendant.dto';
import { Station } from '../../modules/stations/entities/station.entity';

@Injectable()
export class AttendantsService {
  constructor(
    @InjectRepository(Attendant)
    private attendantsRepository: Repository<Attendant>,
    @InjectRepository(Station)
    private stationsRepository: Repository<Station>,
  ) {}

  async create(createAttendantDto: CreateAttendantDto): Promise<Attendant> {
    const attendant = this.attendantsRepository.create(createAttendantDto);

    if (createAttendantDto.stationId) {
      const station = await this.stationsRepository.findOneBy({
        id: createAttendantDto.stationId,
      });
      if (!station) {
        throw new NotFoundException(
          `Station with ID ${createAttendantDto.stationId} not found`,
        );
      }
      attendant.station = station;
    }

    return this.attendantsRepository.save(attendant);
  }

  findAll(): Promise<Attendant[]> {
    return this.attendantsRepository.find({
      relations: ['station', 'transactions'],
    });
  }

  async findOne(id: number): Promise<Attendant> {
    const attendant = await this.attendantsRepository.findOne({
      where: { id },
      relations: ['station', 'transactions'],
    });

    if (!attendant) {
      throw new NotFoundException(`Attendant with ID ${id} not found`);
    }
    return attendant;
  }

  async update(
    id: number,
    updateAttendantDto: UpdateAttendantDto,
  ): Promise<Attendant> {
    const attendant = await this.findOne(id);

    if (updateAttendantDto.stationId) {
      const station = await this.stationsRepository.findOneBy({
        id: updateAttendantDto.stationId,
      });
      if (!station) {
        throw new NotFoundException(
          `Station with ID ${updateAttendantDto.stationId} not found`,
        );
      }
      attendant.station = station;
    }

    return this.attendantsRepository.save({
      ...attendant,
      ...updateAttendantDto,
    });
  }

  async remove(id: number): Promise<void> {
    await this.attendantsRepository.delete(id);
  }

  async findByCode(code: string): Promise<Attendant | null> {
    return this.attendantsRepository.findOneBy({ code });
  }
}
