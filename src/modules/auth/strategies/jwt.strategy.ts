import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { AttendantsService } from '../../attendants/attendants.service';
import { UserRole } from '../../users/interfaces/user.interface';

interface JwtTokenPayload {
  sub: number;
  email?: string;
  role: string;
  code?: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private attendantsService: AttendantsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtTokenPayload) {
    console.log('--- JWT Strategy Validate Call ---');
    console.log('Received Payload (from token):', payload);
    console.log(
      'Payload sub (entity ID):',
      payload.sub,
      'Type:',
      typeof payload.sub,
    );

    const id = Number(payload.sub);

    // --- FIX: Add isNaN check here ---
    if (isNaN(id)) {
      console.error(
        'Authentication failed: Payload sub is not a valid number. Payload:',
        payload,
      );
      throw new UnauthorizedException('Invalid user ID in token.');
    }
    // --- END FIX ---

    console.log('Parsed ID for DB query:', id, 'Type:', typeof id); // Keep for further diagnosis if needed

    let entity: any;
    let actualRole: string;

    if ((payload.role as UserRole) === UserRole.ATTENDANT) {
      console.log(`Validating as Attendant. Attendant ID: ${id}`);
      entity = await this.attendantsService.findOne(id);
      actualRole = UserRole.ATTENDANT;
    } else if (
      (payload.role as UserRole) === UserRole.ADMIN ||
      (payload.role as UserRole) === UserRole.MANAGER
    ) {
      console.log(`Validating as User (Admin/Manager). User ID: ${id}`);
      entity = await this.usersService.findOne(id);
      actualRole = entity?.role;
    } else {
      console.error(
        `Authentication failed: Unknown role in JWT payload: ${payload.role}`,
      );
      throw new UnauthorizedException('Unknown user role in token');
    }

    if (!entity) {
      console.error(
        'Authentication failed: Entity (User or Attendant) not found for ID:',
        id,
        'and role:',
        payload.role,
      );
      throw new UnauthorizedException('User or Attendant not found');
    }

    return {
      id: entity.id,
      email: entity.email || entity.code,
      role: actualRole,
      stationId: entity.station?.id,
    };
  }
}
