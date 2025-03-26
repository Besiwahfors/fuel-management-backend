export class AuthResponseDto {
  access_token: string;
  expires_in: number; // Change to number
  token_type: string;

  constructor(token: string, expiresIn: number) {
    this.access_token = token;
    this.expires_in = expiresIn;
    this.token_type = 'Bearer';
  }
}
