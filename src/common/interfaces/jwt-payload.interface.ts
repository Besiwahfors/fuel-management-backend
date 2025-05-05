export interface JwtPayload {
  userId: number;
  role: string;
  stationId?: number;
}
