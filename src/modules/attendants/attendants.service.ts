// src/modules/attendants/attendants.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendant } from './entities/attendant.entity';
import { CreateAttendantDto } from './dto/create-attendant.dto';
import { UpdateAttendantDto } from './dto/update-attendant.dto';
import { Station } from '../../modules/stations/entities/station.entity';
import { Transaction } from '../../modules/transactions/entities/transaction.entity';

@Injectable()
export class AttendantsService {
  constructor(
    @InjectRepository(Attendant)
    private attendantsRepository: Repository<Attendant>,
    @InjectRepository(Station)
    private stationsRepository: Repository<Station>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async findOne(id: number, checkStation?: number): Promise<Attendant> {
    const attendant = await this.attendantsRepository.findOne({
      where: { id },
      relations: [
        'station', // Load the attendant's assigned station
        'transactions', // Load all transactions for this attendant
        'transactions.station', // <--- CRITICAL: Load the station for EACH transaction
        'transactions.user', // Optional: Load the user for each transaction if needed
      ],
    });

    if (!attendant) {
      throw new NotFoundException(`Attendant with ID ${id} not found`);
    }

    if (checkStation && attendant.station?.id !== checkStation) {
      throw new ForbiddenException('Attendant does not belong to this station');
    }

    return attendant;
  }

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
      relations: ['station'], // Only need attendant's station for the list view
    });
  }

  async update(
    id: number,
    updateAttendantDto: UpdateAttendantDto,
  ): Promise<Attendant> {
    const attendant = await this.findOne(id);

    Object.assign(attendant, updateAttendantDto);

    if (updateAttendantDto.stationId !== undefined) {
      if (updateAttendantDto.stationId === null) {
        attendant.station = null;
        attendant.stationId = null;
      } else {
        const station = await this.stationsRepository.findOneBy({
          id: updateAttendantDto.stationId,
        });
        if (!station) {
          throw new NotFoundException(
            `Station with ID ${updateAttendantDto.stationId} not found`,
          );
        }
        attendant.station = station;
        attendant.stationId = station.id;
      }
    }

    return this.attendantsRepository.save(attendant);
  }

  async remove(id: number): Promise<void> {
    const result = await this.attendantsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Attendant with ID ${id} not found`);
    }
  }

  async findByCode(code: string): Promise<Attendant | null> {
    return this.attendantsRepository.findOneBy({ code });
  }
}
