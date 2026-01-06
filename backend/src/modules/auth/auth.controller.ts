import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiSecurity('X-Tenant-ID')
  async login(
    @Body()
    loginDto: {
      email: string;
      password: string;
      tenantId: string;
    },
  ) {
    return this.authService.login(
      loginDto.email,
      loginDto.password,
      loginDto.tenantId,
    );
  }
}
