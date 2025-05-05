import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { AttendantsService } from './attendants.service';
import { CreateAttendantDto } from './dto/create-attendant.dto';
import { UpdateAttendantDto } from './dto/update-attendant.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user.interface';
import { Request } from 'express';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Controller('attendants')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AttendantsController {
  constructor(private readonly attendantsService: AttendantsService) {}

  @Get('me')
  @Roles(UserRole.ATTENDANT)
  async getCurrentAttendant(@Req() req: Request) {
    if (!req.user) {
      throw new NotFoundException('User not authenticated');
    }

    const payload = req.user as JwtPayload;
    try {
      const attendant = await this.attendantsService.findOne(payload.userId);
      return {
        id: attendant.id,
        code: attendant.code,
        name: attendant.name,
        station: attendant.station,
        createdAt: attendant.createdAt,
      };
    } catch {
      throw new NotFoundException('Attendant not found');
    }
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT)
  async findOne(@Param('id') id: string, @Req() req: Request) {
    if (!req.user) {
      throw new NotFoundException('User not authenticated');
    }

    const payload = req.user as JwtPayload;
    const numericId = parseInt(id, 10);

    if (
      (payload.role as UserRole) === UserRole.ATTENDANT &&
      payload.userId !== numericId
    ) {
      throw new NotFoundException('Attendant not found');
    }

    return this.attendantsService.findOne(numericId);
  }

  // Keep the rest of the endpoints unchanged
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
