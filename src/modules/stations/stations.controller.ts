// src/stations/stations.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Patch, // Import Patch decorator
} from '@nestjs/common';
import { StationsService } from './stations.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto'; // Ensure this DTO exists and uses PartialType
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user.interface';

@Controller('stations')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createStationDto: CreateStationDto) {
    return this.stationsService.create(createStationDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findAll() {
    return this.stationsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findOne(@Param('id') id: string) {
    return this.stationsService.findOne(+id);
  }

  // Current PUT endpoint (replaces the entire resource)
  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateStationDto: UpdateStationDto, // Use the DTO for full replacement
  ) {
    return this.stationsService.update(+id, updateStationDto);
  }

  // NEW PATCH endpoint (for partial updates)
  @Patch(':id') // Use @Patch decorator
  @Roles(UserRole.ADMIN) // Define roles as needed
  patch(
    @Param('id') id: string,
    @Body() updateStationDto: UpdateStationDto, // This DTO should be a PartialType of CreateStationDto
  ) {
    // The service method for PATCH will be the same as update in your current service implementation
    // as it already uses `save({ ...station, ...updateStationDto })` which handles partial updates.
    return this.stationsService.update(+id, updateStationDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.stationsService.remove(+id);
  }

  @Post(':stationId/attendants/:attendantId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  addAttendant(
    @Param('stationId') stationId: string,
    @Param('attendantId') attendantId: string,
  ) {
    return this.stationsService.addAttendant(+stationId, +attendantId);
  }

  @Delete(':stationId/attendants/:attendantId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  removeAttendant(
    @Param('stationId') stationId: string,
    @Param('attendantId') attendantId: string,
  ) {
    return this.stationsService.removeAttendant(+stationId, +attendantId);
  }
}
