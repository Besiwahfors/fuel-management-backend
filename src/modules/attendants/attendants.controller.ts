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
  Patch,
  // NEW: Import these exceptions
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AttendantsService } from './attendants.service';
import { CreateAttendantDto } from './dto/create-attendant.dto';
import { UpdateAttendantDto } from './dto/update-attendant.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user.interface';
import { Request } from 'express';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface'; // Correct path and updated interface

@Controller('attendants')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AttendantsController {
  constructor(private readonly attendantsService: AttendantsService) {}

  @Get('me')
  @Roles(UserRole.ATTENDANT)
  async getCurrentAttendant(@Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated'); // More accurate exception
    }

    const payload = req.user as JwtPayload;
    try {
      // Use payload.id as the attendant's ID
      const attendant = await this.attendantsService.findOne(payload.id);
      return {
        id: attendant.id,
        code: attendant.code,
        name: attendant.name,
        station: attendant.station, // Station object
        createdAt: attendant.createdAt,
      };
    } catch (error) {
      // Log the actual error for debugging
      console.error('Error fetching current attendant:', error);
      throw new NotFoundException('Attendant not found or access denied');
    }
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT)
  async findOne(@Param('id') id: string, @Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated'); // More accurate exception
    }

    const payload = req.user as JwtPayload;
    const numericId = parseInt(id, 10);

    // Security check: Attendant can only view their own details
    if (
      (payload.role as UserRole) === UserRole.ATTENDANT &&
      payload.id !== numericId // <--- Use payload.id here
    ) {
      throw new ForbiddenException(
        'You can only view your own attendant profile.',
      ); // More specific error
    }

    return this.attendantsService.findOne(numericId);
  }

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

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  patch(
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
