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
import { Attendant } from '../attendants/entities/attendant.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private attendantsService: AttendantsService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private parseExpiresInToSeconds(expiresIn: string): number {
    const value = parseInt(expiresIn, 10);
    const unit = expiresIn.replace(value.toString(), '');
    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return value; // Assume seconds if no unit is provided
    }
  }

  private async generateAttendantTokens(attendant: Attendant): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const accessTokenPayload = {
      sub: attendant.id,
      code: attendant.code,
      role: 'attendant',
      stationId: attendant.station?.id, // Include stationId if available
    };

    const secret = this.configService.getOrThrow<string>('JWT_SECRET');
    const accessTokenExpiresIn =
      this.configService.getOrThrow<string>('JWT_EXPIRES_IN');
    const refreshTokenExpiresIn = this.configService.getOrThrow<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );

    const access_token = this.jwtService.sign(accessTokenPayload, {
      secret,
      expiresIn: accessTokenExpiresIn,
    });

    const refreshTokenPayload = {
      sub: attendant.id,
      role: 'attendant',
      type: 'refresh', // Differentiate refresh token
    };

    const refresh_token = this.jwtService.sign(refreshTokenPayload, {
      secret,
      expiresIn: refreshTokenExpiresIn,
    });

    // Hash and store the refresh token in the database
    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
    // Decode without assertion, then check properties
    const decodedRefreshToken = this.jwtService.decode(refresh_token);

    let refreshTokenExpiresAt: Date | null = null;
    if (
      decodedRefreshToken &&
      typeof decodedRefreshToken === 'object' &&
      'exp' in decodedRefreshToken
    ) {
      refreshTokenExpiresAt = new Date(
        (decodedRefreshToken as { exp: number }).exp * 1000,
      );
    }

    await this.attendantsService.update(attendant.id, {
      refreshToken: hashedRefreshToken,
      refreshTokenExpiresAt: refreshTokenExpiresAt,
    });

    const accessTokenExpiresInSeconds =
      this.parseExpiresInToSeconds(accessTokenExpiresIn);

    return {
      access_token,
      refresh_token,
      expires_in: accessTokenExpiresInSeconds,
    };
  }

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
    const expiresIn = this.configService.getOrThrow<string>('JWT_EXPIRES_IN');

    const token = this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });

    const expiresInSeconds = this.parseExpiresInToSeconds(expiresIn);

    return new AuthResponseDto(token, expiresInSeconds + 's');
  }

  async attendantLogin(loginDto: AttendantLoginDto): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const attendant = await this.attendantsService.findByCode(loginDto.code);

    if (!attendant) {
      throw new NotFoundException('Attendant not found');
    }

    // You might want to add a password check here if attendants also have passwords
    // For now, assuming code is the sole authentication factor based on your code.

    return this.generateAttendantTokens(attendant);
  }

  async refreshAttendantToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    try {
      // Decode the refresh token to get payload without verifying signature initially
      const decoded = this.jwtService.decode(refreshToken);

      // Add runtime checks for robustness
      if (
        !decoded ||
        typeof decoded !== 'object' ||
        !('type' in decoded) ||
        !('role' in decoded) ||
        !('sub' in decoded) ||
        !('exp' in decoded)
      ) {
        throw new UnauthorizedException(
          'Invalid or malformed refresh token payload',
        );
      }

      // Assert type after checks to access properties safely
      const typedDecoded = decoded as {
        sub: number;
        role: string;
        type: string;
        exp: number;
      };

      if (
        typedDecoded.type !== 'refresh' ||
        typedDecoded.role !== 'attendant'
      ) {
        throw new UnauthorizedException('Invalid refresh token type or role');
      }

      const attendantId = typedDecoded.sub;
      const attendant = await this.attendantsService.findOne(attendantId);

      if (!attendant || !attendant.refreshToken) {
        throw new UnauthorizedException(
          'Attendant or stored refresh token not found',
        );
      }

      // Verify the provided refresh token against the hashed one stored in DB
      const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        attendant.refreshToken,
      );

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if refresh token has expired based on DB stored expiry
      if (
        attendant.refreshTokenExpiresAt &&
        new Date() > attendant.refreshTokenExpiresAt
      ) {
        // Clear expired refresh token from DB for security
        await this.attendantsService.update(attendantId, {
          refreshToken: null,
          refreshTokenExpiresAt: null,
        });
        throw new UnauthorizedException('Refresh token expired');
      }

      // Generate new access and refresh tokens
      return this.generateAttendantTokens(attendant);
    } catch (error) {
      // If any validation fails, invalidate the stored refresh token for security
      const decodedAttempt = this.jwtService.decode(refreshToken);
      if (
        decodedAttempt &&
        typeof decodedAttempt === 'object' &&
        'sub' in decodedAttempt
      ) {
        await this.attendantsService.update(
          (decodedAttempt as { sub: number }).sub,
          {
            refreshToken: null,
            refreshTokenExpiresAt: null,
          },
        );
      }
      throw error; // Re-throw the error for NestJS exception handling
    }
  }

  async logoutAttendant(attendantId: number): Promise<void> {
    await this.attendantsService.update(attendantId, {
      refreshToken: null,
      refreshTokenExpiresAt: null,
    });
  }
}
