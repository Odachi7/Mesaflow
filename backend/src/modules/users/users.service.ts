import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    email: string;
    password: string;
    fullName: string;
    role: string;
    tenantId: string;
  }): Promise<Omit<User, 'passwordHash'>> {
    // Verificar se email já existe no tenant
    const existing = await this.prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: data.tenantId,
          email: data.email,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        tenantId: data.tenantId,
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        role: data.role,
      },
    });

    // Remover password hash da resposta
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findAll(): Promise<Omit<User, 'passwordHash'>[]> {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(({ passwordHash, ...user }) => user);
  }

  async findOne(id: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findByEmail(email: string, tenantId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId,
          email,
        },
      },
    });
  }

  async update(
    id: string,
    data: {
      fullName?: string;
      role?: string;
      isActive?: boolean;
    },
  ): Promise<Omit<User, 'passwordHash'>> {
    await this.findOne(id);

    const user = await this.prisma.user.update({
      where: { id },
      data,
    });

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    await this.findOne(id);

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
  }
}
