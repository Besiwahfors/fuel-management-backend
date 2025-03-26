import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AttendantsService } from '../attendants/attendants.service';
import * as bcrypt from 'bcrypt';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AttendantLoginDto } from './dto/attendant-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private attendantsService: AttendantsService,
    private jwtService: JwtService,
  ) {}

  async adminLogin(loginDto: AdminLoginDto) {
    const user = await this.usersService.findOneByEmail(loginDto.email);

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async attendantLogin(loginDto: AttendantLoginDto) {
    const attendant = await this.attendantsService.findByCode(loginDto.code);
    if (!attendant) {
      throw new UnauthorizedException('Invalid attendant code');
    }

    const payload = {
      code: attendant.code,
      sub: attendant.id,
      role: 'attendant',
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
