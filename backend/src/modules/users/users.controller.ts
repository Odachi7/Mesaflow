import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Tenant } from '../../common/decorators/tenant.decorator';

@ApiTags('users')
@ApiSecurity('X-Tenant-ID')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  create(
    @Tenant() tenantId: string,
    @Body()
    createUserDto: {
      email: string;
      password: string;
      fullName: string;
      role: string;
    },
  ) {
    return this.usersService.create({
      ...createUserDto,
      tenantId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  update(
    @Param('id') id: string,
    @Body()
    updateUserDto: {
      fullName?: string;
      role?: string;
      isActive?: boolean;
    },
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/password')
  @ApiOperation({ summary: 'Update user password' })
  async updatePassword(
    @Param('id') id: string,
    @Body() body: { newPassword: string },
  ) {
    await this.usersService.updatePassword(id, body.newPassword);
    return { message: 'Password updated successfully' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
