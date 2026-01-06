import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Tenant } from '@prisma/client';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    subdomain: string;
    planType: string;
    settings?: any;
  }): Promise<Tenant> {
    // Verificar se subdomain já existe
    const existing = await this.prisma.tenant.findUnique({
      where: { subdomain: data.subdomain },
    });

    if (existing) {
      throw new ConflictException('Subdomain already in use');
    }

    return this.prisma.tenant.create({
      data: {
        name: data.name,
        subdomain: data.subdomain,
        planType: data.planType,
        settings: data.settings || {},
      },
    });
  }

  async findAll(): Promise<Tenant[]> {
    return this.prisma.tenant.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async findBySubdomain(subdomain: string): Promise<Tenant | null> {
    return this.prisma.tenant.findUnique({
      where: { subdomain },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      planType?: string;
      settings?: any;
      isActive?: boolean;
    },
  ): Promise<Tenant> {
    const tenant = await this.findOne(id);

    return this.prisma.tenant.update({
      where: { id: tenant.id },
      data,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.tenant.delete({ where: { id } });
  }
}
