import { UserRole } from '../dto/auth.dto';

export class UserRegisteredEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: UserRole,
    public readonly isEmailVerified: boolean,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class UserLoggedInEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class PasswordResetRequestedEvent {
  constructor(
    public readonly email: string,
    public readonly token: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class UserRoleUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly previousRole: UserRole,
    public readonly newRole: UserRole,
    public readonly updatedBy: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
