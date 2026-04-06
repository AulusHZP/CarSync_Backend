import authRepository from '../repositories/authRepository';
import { config } from '../config/env';
import { createAuthToken, hashPassword, verifyPassword } from '../utils/auth';

export interface AuthUserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: AuthUserResponse;
  token: string;
}

type UserRecord = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export class AuthServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AuthServiceError';
  }
}

export class AuthService {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await authRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new AuthServiceError('Email already registered', 409);
    }

    const user = await authRepository.createUser({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash: hashPassword(password),
    });

    const token = createAuthToken(user.id, user.email, config.authSecret);

    return {
      user: this.mapUser(user),
      token,
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await authRepository.findByEmail(normalizedEmail);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new AuthServiceError('Invalid email or password', 401);
    }

    const token = createAuthToken(user.id, user.email, config.authSecret);

    return {
      user: this.mapUser(user),
      token,
    };
  }

  private mapUser(user: UserRecord): AuthUserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}

export default new AuthService();
