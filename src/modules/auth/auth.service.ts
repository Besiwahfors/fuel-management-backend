import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AttendantsService } from '../attendants/attendants.service';
import * as bcrypt from 'bcrypt';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AttendantLoginDto } from './dto/attendant-login.dto';
import { ConfigService } from '@nestjs/config';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private attendantsService: AttendantsService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async adminLogin(loginDto: AdminLoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findOneByEmail(loginDto.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const secret = this.configService.getOrThrow<string>('JWT_SECRET');
    const expiresIn = this.configService.getOrThrow<number>('JWT_EXPIRES_IN');

    const token = this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });

    return new AuthResponseDto(token, expiresIn);
  }

  async attendantLogin(
    loginDto: AttendantLoginDto,
  ): Promise<{ access_token: string }> {
    const attendant = await this.attendantsService.findByCode(loginDto.code);

    if (!attendant) {
      throw new NotFoundException('Attendant not found');
    }

    const payload = {
      code: attendant.code,
      sub: attendant.id,
      role: 'attendant',
    };

    const secret = this.configService.getOrThrow<string>('JWT_SECRET');
    const expiresIn = this.configService.getOrThrow<number>('JWT_EXPIRES_IN');

    const token = this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });

    return { access_token: token };
  }
}
