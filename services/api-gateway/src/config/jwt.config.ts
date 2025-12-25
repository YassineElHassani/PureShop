import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig = (): JwtModuleOptions => ({
  secret: process.env.JWT_SECRET || 'your-super-secret-key',
  signOptions: {
    expiresIn: Number(process.env.JWT_EXPIRATION) || '24h',
  },
});