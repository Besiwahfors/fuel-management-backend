// src/modules/attendants/attendants.controller.ts
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
  Patch, // Import Patch decorator for partial updates
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
      // Ensure findOne here also loads relations if needed for this 'me' endpoint
      const attendant = await this.attendantsService.findOne(payload.userId);
      return {
        id: attendant.id,
        code: attendant.code,
        name: attendant.name,
        station: attendant.station, // Station object
        createdAt: attendant.createdAt,
        // You might want to return transactions here too if the 'me' endpoint needs them
        // transactions: attendant.transactions,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Be more specific with error handling if possible
      throw new NotFoundException('Attendant not found or access denied');
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

    // Security check: Attendant can only view their own details
    if (
      (payload.role as UserRole) === UserRole.ATTENDANT &&
      payload.userId !== numericId // Assuming payload.userId is the attendant's ID
    ) {
      throw new NotFoundException('Attendant not found or unauthorized access'); // Use 403 Forbidden for clearer error
    }

    // The service's findOne already loads 'station' and 'transactions'
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
    // The service's findAll already loads 'station'
    return this.attendantsService.findAll();
  }

  @Put(':id') // For full replacement
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(
    @Param('id') id: string,
    @Body() updateAttendantDto: UpdateAttendantDto, // Use UpdateAttendantDto for full updates
  ) {
    return this.attendantsService.update(+id, updateAttendantDto);
  }

  @Patch(':id') // Added PATCH for partial updates, uses the same service method
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  patch(
    @Param('id') id: string,
    @Body() updateAttendantDto: UpdateAttendantDto, // UpdateAttendantDto works for partial updates too
  ) {
    // The service update method handles partial updates correctly
    return this.attendantsService.update(+id, updateAttendantDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.attendantsService.remove(+id);
  }
}
