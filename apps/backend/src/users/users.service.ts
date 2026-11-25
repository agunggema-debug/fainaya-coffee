import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '@prisma/client';

export interface FindAllOptions {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface RequestUser {
  id: string;
  email: string;
  role: string;
  branchId?: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string, currentUser?: RequestUser) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { branch: true },
    });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Role-based access control for viewing user detail
    if (currentUser) {
      if (currentUser.role === UserRole.MANAGER_BRANCH) {
        // Manager branch can only view users in their own branch
        if (user.branchId !== currentUser.branchId) {
          throw new ForbiddenException('Anda tidak diizinkan melihat user di cabang lain');
        }
      } else if (currentUser.role !== UserRole.ADMIN_HQ && currentUser.id !== id) {
        // KASIR, BARISTA, WAITER can only view their own profile
        throw new ForbiddenException('Role Anda tidak diizinkan untuk melihat detail user lain');
      }
    }

    const { password, ...result } = user;
    return result as Omit<User, 'password'>;
  }

  async findAll(options: FindAllOptions = {}, currentUser?: RequestUser) {
    const { page = 1, limit = 20, search = '', branchId = '' } = options;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Role-based filtering (PRD 4.3 - RBAC)
    // ADMIN_HQ sees all users across all branches
    // MANAGER_BRANCH sees only users in their own branch
    // KASIR/BARISTA/WAITER cannot list users
    if (currentUser) {
      if (currentUser.role === UserRole.ADMIN_HQ) {
        if (branchId) {
          where.branchId = branchId;
        }
      } else if (currentUser.role === UserRole.MANAGER_BRANCH) {
        if (currentUser.branchId) {
          where.branchId = currentUser.branchId;
        }
      } else {
        throw new ForbiddenException('Role Anda tidak diizinkan untuk melihat daftar user');
      }
    } else if (branchId) {
      where.branchId = branchId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          commissionRate: true,
          createdAt: true,
          updatedAt: true,
          branchId: true,
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page: parseInt(page.toString(), 10),
        limit: parseInt(limit.toString(), 10),
        total: total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    } as PaginatedResult<typeof users[0]>;
  }

  async create(data: any, currentUser?: RequestUser) {
    const createData = { ...data };

    if (currentUser) {
      if (currentUser.role === UserRole.MANAGER_BRANCH) {
        // Manager can only create staff for their own branch
        createData.branchId = currentUser.branchId;
        if (createData.role === UserRole.ADMIN_HQ || createData.role === UserRole.MANAGER_BRANCH) {
          throw new ForbiddenException(
            'Manager Cabang hanya dapat membuat user dengan role KASIR, BARISTA, atau WAITER',
          );
        }
      } else if (currentUser.role !== UserRole.ADMIN_HQ) {
        throw new ForbiddenException('Hanya ADMIN_HQ dan MANAGER_BRANCH yang dapat membuat user');
      }
    }

    if (createData.password && !createData.password.startsWith('$2')) {
      createData.password = await bcrypt.hash(createData.password, 10);
    }

    if (createData.role && !Object.values(UserRole).includes(createData.role)) {
      throw new BadRequestException('Role tidak valid');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: createData.email },
    });
    if (existing) {
      throw new BadRequestException('Email sudah terdaftar');
    }

    const user = await this.prisma.user.create({
      data: createData,
      include: { branch: true },
    });
    const { password, ...result } = user;
    return result as Omit<User, 'password'>;
  }

  async update(id: string, data: any, currentUser?: RequestUser) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Role-based access control for updating user
    if (currentUser) {
      if (currentUser.role === UserRole.MANAGER_BRANCH) {
        // Manager branch can only update users in their own branch
        if (existingUser.branchId !== currentUser.branchId) {
          throw new ForbiddenException('Anda tidak diizinkan mengedit user di cabang lain');
        }
        // Manager cannot change role to ADMIN_HQ or change branch
        if (data.role === UserRole.ADMIN_HQ) {
          throw new ForbiddenException('Manager Cabang tidak diizinkan menetapkan role ADMIN_HQ');
        }
        if (data.branchId && data.branchId !== currentUser.branchId) {
          throw new ForbiddenException('Manager Cabang tidak diizinkan memindahkan user ke cabang lain');
        }
      } else if (currentUser.role !== UserRole.ADMIN_HQ) {
        // Staff can only update their own profile (name, phone, pin)
        if (currentUser.id !== id) {
          throw new ForbiddenException('Role Anda tidak diizinkan untuk mengedit user lain');
        }
        delete data.role;
        delete data.branchId;
        delete data.isActive;
        delete data.commissionRate;
      }
    }

    const updateData = { ...data };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    if (updateData.role && !Object.values(UserRole).includes(updateData.role)) {
      throw new BadRequestException('Role tidak valid');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: { branch: true },
    });
    const { password, ...result } = user;
    return result as Omit<User, 'password'>;
  }

  async remove(id: string, currentUser?: RequestUser) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Only ADMIN_HQ can delete users
    if (currentUser && currentUser.role !== UserRole.ADMIN_HQ) {
      throw new ForbiddenException('Hanya ADMIN_HQ yang diizinkan menghapus user');
    }

    if (currentUser && currentUser.id === id) {
      throw new BadRequestException('Anda tidak dapat menghapus akun Anda sendiri');
    }

    if (user.role === UserRole.ADMIN_HQ) {
      const adminCount = await this.prisma.user.count({
        where: { role: UserRole.ADMIN_HQ, isActive: true },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('Tidak dapat menghapus user ADMIN_HQ sebagai admin terakhir');
      }
    }

    return this.prisma.user.delete({ where: { id } });
  }
}
