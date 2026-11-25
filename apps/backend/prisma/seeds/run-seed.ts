import { PrismaClient } from '@prisma/client';
import { seedBranches, seedUsers } from './branch-user-seeds';
import { seedCategories, seedProducts } from './category-product-seeds';
import { seedTables } from './table-seeds';
import { seedCustomersAndLoyalty } from './customer-loyalty-seeds';
import { seedInventoryAndBOM } from './inventory-bom-seeds';
import { seedAccounting } from './accounting-seeds';
import { seedVouchers } from './voucher-seeds';
import { seedSuppliers } from './supplier-po-seeds';
import { seedDeliveryConfigs } from './delivery-seeds';
import { seedShiftsAndAttendance } from './hr-shift-seeds';
import { seedOrders } from './order-seeds';
import { seedReservationsAndQueue } from './reservation-queue-seeds';

const prisma = new PrismaClient();

export async function runSeed() {
  console.log('🌱 Starting Faianaya Coffee comprehensive seed...');

  // 1. Branches
  const branches = await seedBranches();
  console.log(`✅ [1/14] Branches created/verified (${branches.length})`);

  // 2. Users (with bcrypt hashed passwords & all roles)
  const users = await seedUsers(branches);
  console.log(`✅ [2/14] Users created/verified (${users.length})`);

  // 3. Categories
  await seedCategories(branches);
  console.log('✅ [3/14] Menu Categories created/verified');

  // 4. Products
  await seedProducts(branches);
  console.log('✅ [4/14] Menu Products created/verified');

  // 5. Tables & Floor Plan
  await seedTables(branches);
  console.log('✅ [5/14] Floor Plan Tables created/verified (13 tables per branch)');

  // 6. Customers & Loyalty Tiers
  await seedCustomersAndLoyalty(branches);
  console.log('✅ [6/14] Customers & Loyalty Tiers created/verified');

  // 7. Raw Materials, Inventory & BOM Recipes
  await seedInventoryAndBOM(branches);
  console.log('✅ [7/14] Raw Materials, Stock Inventory & BOM Recipes created/verified');

  // 8. Chart of Accounts & Accounting Period
  await seedAccounting(branches);
  console.log('✅ [8/14] Chart of Accounts & Accounting Period created/verified');

  // 9. Vouchers & Promos
  await seedVouchers(branches);
  console.log('✅ [9/14] Vouchers & Promotional Discounts created/verified');

  // 10. Suppliers
  await seedSuppliers(branches);
  console.log('✅ [10/14] Suppliers created/verified');

  // 11. Delivery Platform Configs
  await seedDeliveryConfigs(branches);
  console.log('✅ [11/14] Delivery Platform Configs created/verified (GoFood, GrabFood, ShopeeFood)');

  // 12. Shifts & Attendance Records
  await seedShiftsAndAttendance(branches, users);
  console.log('✅ [12/14] Staff Shifts & Attendance Clock-in created/verified');

  // 13. Orders, Payments & OrderItems
  await seedOrders(branches, users);
  console.log('✅ [13/14] Historical & Active Orders created/verified (POS & KDS)');

  // 14. Reservations & Queue Waiting List
  await seedReservationsAndQueue(branches);
  console.log('✅ [14/14] Table Reservations & Order Queue created/verified');

  console.log('🎉 Faianaya Coffee seed completed successfully!');
  return { branches, users };
}
