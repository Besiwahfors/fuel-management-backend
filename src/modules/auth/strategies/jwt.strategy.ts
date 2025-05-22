import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

interface JwtPayload {
  sub: number; // This needs to be 'number'
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // >>> ADD THESE console.log LINES <<<
    console.log('--- JWT Strategy Validate Call ---');
    console.log('Received Payload:', payload);
    console.log(
      'Payload sub (user ID):',
      payload.sub,
      'Type:',
      typeof payload.sub,
    );
    // >>> END ADDITIONS <<<

    const user = await this.usersService.findOne(payload.sub); // This is where the NaN is being used

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
