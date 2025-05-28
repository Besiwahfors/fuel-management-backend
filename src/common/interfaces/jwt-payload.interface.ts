export interface JwtPayload {
  id: number; // The primary ID of the authenticated entity (user.id OR attendant.id)
  email?: string; // Optional: for User entities
  code?: string; // Optional: for Attendant entities (if they have a code)
  role: string; // The role string ('attendant', 'admin', 'manager')
  stationId?: number; // Optional: Specific to Attendants, if you want it easily available on req.user
}
