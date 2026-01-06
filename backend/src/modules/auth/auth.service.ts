import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
    tenantId: string,
  ): Promise<any> {
    const user = await this.usersService.findByEmail(email, tenantId);

    if (!user) {
      throw new UnauthorizedException('Usuário inválido!');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha inválida!');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Conta do usuário inativa!');
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(email: string, password: string, tenantId: string) {
    const user = await this.validateUser(email, password, tenantId);

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
