import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Token expiration time',
    example: '1h',
  })
  expires_in: string;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  token_type: string;

  constructor(access_token: string, expires_in: string) {
    this.access_token = access_token;
    this.expires_in = expires_in;
    this.token_type = 'Bearer';
  }
}
