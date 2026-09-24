import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserRole, UserProfile, DelegateUserDto } from '@oriental/types';

@Injectable()
export class AuthService {
  private users: UserProfile[] = [
    {
      id: 'usr-001',
      name: 'Chandra Santoso',
      email: 'chandra.owner@oriental.co.id',
      phone: '08119888201',
      role: UserRole.SUPER_ADMIN,
      tenantId: 'tenant-oriental-01',
      isActive: true,
      createdAt: new Date('2026-01-01'),
    },
    {
      id: 'usr-002',
      name: 'Budi Wijaya',
      email: 'budi.manager@oriental.co.id',
      phone: '08123456701',
      role: UserRole.ADMIN_MANAGER,
      tenantId: 'tenant-oriental-01',
      delegatedById: 'usr-001',
      delegatedByName: 'Chandra Santoso (Owner)',
      isActive: true,
      createdAt: new Date('2026-01-15'),
    },
    {
      id: 'usr-003',
      name: 'Siti Rahma',
      email: 'siti.kasir@oriental.co.id',
      phone: '08139876543',
      role: UserRole.ADMIN_KASIR,
      tenantId: 'tenant-oriental-01',
      delegatedById: 'usr-002',
      delegatedByName: 'Budi Wijaya (Manager)',
      isActive: true,
      createdAt: new Date('2026-02-01'),
    },
    {
      id: 'usr-004',
      name: 'Joko Prayitno',
      email: 'joko.gudang@oriental.co.id',
      phone: '08156789123',
      role: UserRole.STAFF_GUDANG,
      tenantId: 'tenant-oriental-01',
      delegatedById: 'usr-002',
      delegatedByName: 'Budi Wijaya (Manager)',
      isActive: true,
      createdAt: new Date('2026-02-10'),
    },
    {
      id: 'usr-005',
      name: 'Rahmat Hidayat',
      email: 'rahmat.waste@oriental.co.id',
      phone: '08178912345',
      role: UserRole.OPERATOR_WASTE,
      tenantId: 'tenant-oriental-01',
      delegatedById: 'usr-002',
      delegatedByName: 'Budi Wijaya (Manager)',
      isActive: true,
      createdAt: new Date('2026-02-15'),
    },
  ];

  async login(email: string, role?: UserRole) {
    const matched = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const finalRole = matched ? matched.role : (role || UserRole.SUPER_ADMIN);
    const userName = matched ? matched.name : 'Chandra Santoso';

    return {
      accessToken: 'oriental_jwt_token_sample_' + Date.now(),
      user: {
        id: matched ? matched.id : 'usr-001',
        name: userName,
        email,
        role: finalRole,
        tenantId: 'tenant-oriental-01',
      },
    };
  }

  async getAllUsers(): Promise<UserProfile[]> {
    return this.users;
  }

  async delegateUser(
    creatorRole: UserRole,
    creatorName: string,
    creatorId: string,
    dto: DelegateUserDto,
  ): Promise<{ success: boolean; message: string; user: UserProfile }> {
    // 1. Strict Isolation: Kasir, Gudang, dan Waste tidak boleh mendelegasikan
    if (
      creatorRole === UserRole.ADMIN_KASIR ||
      creatorRole === UserRole.STAFF_GUDANG ||
      creatorRole === UserRole.OPERATOR_WASTE
    ) {
      throw new UnauthorizedException('Akses Ditolak: Anda tidak memiliki wewenang mendelegasikan staf baru');
    }

    // 2. Admin Manager tidak boleh membuat Super Admin atau sesama Admin Manager
    if (
      creatorRole === UserRole.ADMIN_MANAGER &&
      (dto.role === UserRole.SUPER_ADMIN || dto.role === UserRole.ADMIN_MANAGER)
    ) {
      throw new UnauthorizedException(
        'Admin Manager hanya berhak mendelegasikan staf operasional (Kasir, Gudang, Waste, Purchasing)',
      );
    }

    // 3. Validasi email unik
    const existing = this.users.find((u) => u.email.toLowerCase() === dto.email.toLowerCase());
    if (existing) {
      throw new BadRequestException(`Email "${dto.email}" sudah terdaftar di sistem`);
    }

    const newUser: UserProfile = {
      id: `usr-${String(this.users.length + 1).padStart(3, '0')}`,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      role: dto.role,
      tenantId: 'tenant-oriental-01',
      delegatedById: creatorId,
      delegatedByName: `${creatorName} (${creatorRole})`,
      isActive: true,
      createdAt: new Date(),
    };

    this.users.unshift(newUser);

    return {
      success: true,
      message: `Pengguna ${newUser.name} (${newUser.role}) berhasil didelegasikan oleh ${creatorName}`,
      user: newUser,
    };
  }

  async toggleUserStatus(id: string): Promise<UserProfile> {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new BadRequestException('User tidak ditemukan');
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Akun Super Admin (Owner) tidak dapat dinonaktifkan');
    }
    user.isActive = !user.isActive;
    return user;
  }
}
