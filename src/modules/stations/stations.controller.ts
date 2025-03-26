import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { StationsService } from './stations.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
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

  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateStationDto: UpdateStationDto) {
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
