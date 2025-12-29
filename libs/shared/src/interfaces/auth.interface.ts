import { UserRole } from '../dto/auth.dto';
import { IAuditTrail, IBaseEntity } from './common.interface';

export interface IUser extends IBaseEntity, IAuditTrail {
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
}

export interface IUserProfile extends Omit<IUser, 'passwordHash'> {}

export interface IJwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  permissions?: string[];
}

export interface IRefreshTokenPayload {
  sub: string;
  sessionId: string;
  issuedAt: number;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: IUserProfile;
}
