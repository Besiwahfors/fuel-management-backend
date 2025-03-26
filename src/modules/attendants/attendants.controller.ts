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
import { AttendantsService } from './attendants.service';
import { CreateAttendantDto } from './dto/create-attendant.dto';
import { UpdateAttendantDto } from './dto/update-attendant.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user.interface';

@Controller('attendants')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AttendantsController {
  constructor(private readonly attendantsService: AttendantsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() createAttendantDto: CreateAttendantDto) {
    return this.attendantsService.create(createAttendantDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findAll() {
    return this.attendantsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findOne(@Param('id') id: string) {
    return this.attendantsService.findOne(+id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(
    @Param('id') id: string,
    @Body() updateAttendantDto: UpdateAttendantDto,
  ) {
    return this.attendantsService.update(+id, updateAttendantDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.attendantsService.remove(+id);
  }
}
