import { User } from '@prisma/client';
import prisma from '../config/database';

interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

export class AuthRepository {
  async createUser(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }
}

export default new AuthRepository();
