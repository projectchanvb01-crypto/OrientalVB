import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserRole, DelegateUserDto } from '@oriental/types';

@ApiTags('Authentication & RBAC Delegation')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user dengan peran (Super Admin, Manager, Kasir)' })
  login(@Body() body: { email: string; role?: UserRole }) {
    return this.authService.login(body.email, body.role || UserRole.SUPER_ADMIN);
  }

  @Get('users')
  @ApiOperation({ summary: 'Daftar semua pengguna terdelegasi dalam sistem' })
  getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Post('delegate')
  @ApiOperation({ summary: 'Delegasi peran bawahan (Owner -> Manager -> Kasir)' })
  delegateUser(
    @Body()
    body: {
      creatorRole: UserRole;
      creatorName: string;
      creatorId: string;
      dto: DelegateUserDto;
    },
  ) {
    return this.authService.delegateUser(
      body.creatorRole,
      body.creatorName || 'Super Admin',
      body.creatorId || 'usr-001',
      body.dto,
    );
  }

  @Patch('users/:id/toggle')
  @ApiOperation({ summary: 'Aktifkan atau nonaktifkan akun pengguna' })
  toggleUserStatus(@Param('id') id: string) {
    return this.authService.toggleUserStatus(id);
  }
}
