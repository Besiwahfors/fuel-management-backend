import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AttendantLoginDto } from './dto/attendant-login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email?: string;
    code?: string;
    role: string;
    stationId?: number;
  };
}

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(@Body() loginDto: AdminLoginDto): Promise<AuthResponseDto> {
    return this.authService.adminLogin(loginDto);
  }

  @Post('attendant/login')
  @HttpCode(HttpStatus.OK)
  async attendantLogin(@Body() loginDto: AttendantLoginDto): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    return this.authService.attendantLogin(loginDto);
  }

  @Post('attendant/refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshAttendantToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    return this.authService.refreshAttendantToken(refreshTokenDto.refreshToken);
  }

  @Post('attendant/logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async attendantLogout(@Req() req: AuthenticatedRequest) {
    await this.authService.logoutAttendant(req.user.id);
    return { message: 'Successfully logged out and token invalidated.' };
  }
}
