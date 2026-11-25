// Seed data for Faianaya Coffee - Branches and Users
import { PrismaClient, UserRole } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================================
// BRANCHES
// ============================================================

export async function seedBranches() {
  const branch1 = await prisma.branch.upsert({
    where: { code: 'MAIN-001' },
    update: {
      name: 'Fainaya Coffee - HQ Jakarta Pusat',
      taxRate: 0.11,
      serviceCharge: 0.05,
    },
    create: {
      id: uuid(),
      name: 'Fainaya Coffee - HQ Jakarta Pusat',
      code: 'MAIN-001',
      address: 'Jl. Merdeka No. 1, Gambir, Jakarta Pusat',
      phone: '021-3840001',
      email: 'hq@faianaya.coffee',
      taxRate: 0.11,
      serviceCharge: 0.05,
    },
  });

  const branch2 = await prisma.branch.upsert({
    where: { code: 'BRG-001' },
    update: {
      name: 'Fainaya Coffee - Cabang Margonda Depok',
      taxRate: 0.11,
      serviceCharge: 0.05,
    },
    create: {
      id: uuid(),
      name: 'Fainaya Coffee - Cabang Margonda Depok',
      code: 'BRG-001',
      address: 'Jl. Margonda Raya No. 88, Depok',
      phone: '021-7720002',
      email: 'depok@faianaya.coffee',
      taxRate: 0.11,
      serviceCharge: 0.05,
    },
  });

  return [branch1, branch2];
}

// ============================================================
// USERS
// ============================================================

export async function seedUsers(branches: any[]) {
  const [hqBranch, depokBranch] = branches;

  // Salt & hash standard passwords
  const passwordAdmin = await bcrypt.hash('Admin@123', 10);
  const passwordManager = await bcrypt.hash('Manager@123', 10);
  const passwordKasir = await bcrypt.hash('Kasir@123', 10);
  const passwordBarista = await bcrypt.hash('Barista@123', 10);
  const passwordWaiter = await bcrypt.hash('Waiter@123', 10);

  const seed = [
    // 1. ADMIN HQ (Superadmin - All access)
    {
      id: uuid(),
      branchId: hqBranch.id,
      email: 'admin@faianaya.coffee',
      password: passwordAdmin,
      name: 'Bambang Sudiro (Admin HQ)',
      phone: '08111000111',
      role: UserRole.ADMIN_HQ,
      commissionRate: 0,
      isActive: true,
      pin: '1234',
    },
    // 2. MANAGER CABANG DEPOK
    {
      id: uuid(),
      branchId: depokBranch.id,
      email: 'manager@faianaya.coffee',
      password: passwordManager,
      name: 'Rian Ardiansyah (Manager Depok)',
      phone: '08122000222',
      role: UserRole.MANAGER_BRANCH,
      commissionRate: 0.05,
      isActive: true,
      pin: '5678',
    },
    // 3. KASIR CABANG DEPOK
    {
      id: uuid(),
      branchId: depokBranch.id,
      email: 'kasir@faianaya.coffee',
      password: passwordKasir,
      name: 'Anisa Maharani (Kasir Depok)',
      phone: '08133000333',
      role: UserRole.KASIR,
      commissionRate: 0.03,
      isActive: true,
      pin: '1111',
    },
    // 4. BARISTA CABANG DEPOK
    {
      id: uuid(),
      branchId: depokBranch.id,
      email: 'barista@faianaya.coffee',
      password: passwordBarista,
      name: 'Fikri Pratama (Barista Depok)',
      phone: '08144000444',
      role: UserRole.BARISTA,
      commissionRate: 0.02,
      isActive: true,
      pin: '2222',
    },
    // 5. WAITER CABANG DEPOK
    {
      id: uuid(),
      branchId: depokBranch.id,
      email: 'waiter@faianaya.coffee',
      password: passwordWaiter,
      name: 'Dimas Setiawan (Waiter Depok)',
      phone: '08155000555',
      role: UserRole.WAITER,
      commissionRate: 0.01,
      isActive: true,
      pin: '3333',
    },
    // 6. MANAGER HQ
    {
      id: uuid(),
      branchId: hqBranch.id,
      email: 'manager.hq@faianaya.coffee',
      password: passwordManager,
      name: 'Hendrik Wijaya (Manager HQ)',
      phone: '08166000666',
      role: UserRole.MANAGER_BRANCH,
      commissionRate: 0.05,
      isActive: true,
      pin: '9988',
    },
    // 7. KASIR HQ
    {
      id: uuid(),
      branchId: hqBranch.id,
      email: 'kasir.hq@faianaya.coffee',
      password: passwordKasir,
      name: 'Tiara Safitri (Kasir HQ)',
      phone: '08177000777',
      role: UserRole.KASIR,
      commissionRate: 0.03,
      isActive: true,
      pin: '4444',
    },
    // 8. BARISTA HQ
    {
      id: uuid(),
      branchId: hqBranch.id,
      email: 'barista.hq@faianaya.coffee',
      password: passwordBarista,
      name: 'Agus Gunawan (Barista HQ)',
      phone: '08188000888',
      role: UserRole.BARISTA,
      commissionRate: 0.02,
      isActive: true,
      pin: '5555',
    },
  ];

  const createdUsers = [];
  for (const data of seed) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!existing) {
      const user = await prisma.user.create({ data });
      createdUsers.push(user);
    } else {
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          role: data.role,
          password: data.password,
          branchId: data.branchId,
          pin: data.pin,
          commissionRate: data.commissionRate,
          isActive: true,
        },
      });
      createdUsers.push(updated);
    }
  }

  return createdUsers;
}
