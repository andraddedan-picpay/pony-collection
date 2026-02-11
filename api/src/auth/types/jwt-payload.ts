export interface JwtPayload {
  sub: string; // User ID
  email: string;
  name: string;
  iat?: number; // Issued at (gerado automaticamente)
  exp?: number; // Expiration (gerado automaticamente)
}
