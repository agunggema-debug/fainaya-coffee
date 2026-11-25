// Seed data for Faianaya Coffee - Orders, Payments & OrderItems
import {
  PrismaClient,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

export async function seedOrders(branches: any[], users: any[]) {
  const [hqBranch, depokBranch] = branches;

  const kasirDepok = users.find((u) => u.email === 'kasir@faianaya.coffee') || users[0];
  const tables = await prisma.table.findMany({ where: { branchId: depokBranch.id } });
  const customers = await prisma.customer.findMany({ where: { branchId: depokBranch.id } });
  const products = await prisma.product.findMany({ where: { branchId: depokBranch.id } });

  if (tables.length === 0 || products.length === 0) return;

  const latte = products.find((p) => p.name === 'Caffe Latte') || products[0];
  const croissant = products.find((p) => p.name === 'Butter Croissant Premium') || products[1];
  const icedMacchiato = products.find((p) => p.name === 'Iced Caramel Macchiato') || products[2];
  const v60 = products.find((p) => p.name.includes('V60')) || products[3];
  const nasgor = products.find((p) => p.name.includes('Nasi Goreng')) || products[4];

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');

  // 1. Order #1 - COMPLETED (Dine-in Table 1, Cash)
  const existingOrder1 = await prisma.order.findUnique({
    where: { orderNumber: `INV-${dateStr}-1001` },
  });

  if (!existingOrder1) {
    const subtotal1 = Number(latte.sellingPrice) + Number(croissant.sellingPrice);
    const tax1 = Math.round(subtotal1 * 0.11);
    const service1 = Math.round(subtotal1 * 0.05);
    const total1 = subtotal1 + tax1 + service1;

    const order1 = await prisma.order.create({
      data: {
        id: uuid(),
        branchId: depokBranch.id,
        orderNumber: `INV-${dateStr}-1001`,
        userId: kasirDepok.id,
        tableId: tables[0]?.id,
        customerId: customers[0]?.id,
        customerName: customers[0]?.name || 'Budi Santoso',
        customerPhone: customers[0]?.phone,
        orderType: OrderType.DINE_IN,
        status: OrderStatus.COMPLETED,
        subtotal: new Prisma.Decimal(subtotal1),
        taxAmount: new Prisma.Decimal(tax1),
        serviceChargeAmount: new Prisma.Decimal(service1),
        totalAmount: new Prisma.Decimal(total1),
        paidAmount: new Prisma.Decimal(total1),
        changeAmount: new Prisma.Decimal(50000 - total1 > 0 ? 50000 - total1 : 0),
        completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        orderItems: {
          create: [
            {
              id: uuid(),
              productId: latte.id,
              name: latte.name,
              price: latte.sellingPrice,
              quantity: 1,
              station: 'barista',
              status: 'served',
            },
            {
              id: uuid(),
              productId: croissant.id,
              name: croissant.name,
              price: croissant.sellingPrice,
              quantity: 1,
              station: 'kitchen',
              status: 'served',
            },
          ],
        },
        payments: {
          create: {
            id: uuid(),
            method: PaymentMethod.CASH,
            amount: new Prisma.Decimal(total1),
            status: PaymentStatus.PAID,
            paidAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          },
        },
      },
    });
  }

  // 2. Order #2 - COMPLETED (Dine-in Table 2, QRIS)
  const existingOrder2 = await prisma.order.findUnique({
    where: { orderNumber: `INV-${dateStr}-1002` },
  });

  if (!existingOrder2) {
    const subtotal2 = Number(icedMacchiato.sellingPrice) * 2;
    const tax2 = Math.round(subtotal2 * 0.11);
    const service2 = Math.round(subtotal2 * 0.05);
    const total2 = subtotal2 + tax2 + service2;

    await prisma.order.create({
      data: {
        id: uuid(),
        branchId: depokBranch.id,
        orderNumber: `INV-${dateStr}-1002`,
        userId: kasirDepok.id,
        tableId: tables[1]?.id,
        customerId: customers[1]?.id,
        customerName: customers[1]?.name || 'Siti Rahma',
        customerPhone: customers[1]?.phone,
        orderType: OrderType.DINE_IN,
        status: OrderStatus.COMPLETED,
        subtotal: new Prisma.Decimal(subtotal2),
        taxAmount: new Prisma.Decimal(tax2),
        serviceChargeAmount: new Prisma.Decimal(service2),
        totalAmount: new Prisma.Decimal(total2),
        paidAmount: new Prisma.Decimal(total2),
        completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        orderItems: {
          create: [
            {
              id: uuid(),
              productId: icedMacchiato.id,
              name: icedMacchiato.name,
              price: icedMacchiato.sellingPrice,
              quantity: 2,
              notes: 'Less ice, normal sugar',
              station: 'barista',
              status: 'served',
            },
          ],
        },
        payments: {
          create: {
            id: uuid(),
            method: PaymentMethod.QRIS,
            amount: new Prisma.Decimal(total2),
            status: PaymentStatus.PAID,
            paidAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            transactionId: `QRIS-${Date.now()}`,
          },
        },
      },
    });
  }

  // 3. Order #3 - PREPARING (Active in KDS! Barista Station & Kitchen)
  const existingOrder3 = await prisma.order.findUnique({
    where: { orderNumber: `INV-${dateStr}-1003` },
  });

  if (!existingOrder3) {
    const subtotal3 = Number(v60.sellingPrice) + Number(nasgor.sellingPrice);
    const tax3 = Math.round(subtotal3 * 0.11);
    const service3 = Math.round(subtotal3 * 0.05);
    const total3 = subtotal3 + tax3 + service3;

    const order3 = await prisma.order.create({
      data: {
        id: uuid(),
        branchId: depokBranch.id,
        orderNumber: `INV-${dateStr}-1003`,
        userId: kasirDepok.id,
        tableId: tables[2]?.id,
        customerName: 'Pak Wahyu (Meja T-03)',
        orderType: OrderType.DINE_IN,
        status: OrderStatus.PREPARING,
        subtotal: new Prisma.Decimal(subtotal3),
        taxAmount: new Prisma.Decimal(tax3),
        serviceChargeAmount: new Prisma.Decimal(service3),
        totalAmount: new Prisma.Decimal(total3),
        paidAmount: new Prisma.Decimal(total3),
        orderItems: {
          create: [
            {
              id: uuid(),
              productId: v60.id,
              name: v60.name,
              price: v60.sellingPrice,
              quantity: 1,
              notes: 'Gilingan medium, rasio 1:15',
              station: 'barista',
              status: 'preparing',
            },
            {
              id: uuid(),
              productId: nasgor.id,
              name: nasgor.name,
              price: nasgor.sellingPrice,
              quantity: 1,
              notes: 'Level pedas sedang, telur ceplok setengah matang',
              station: 'kitchen',
              status: 'preparing',
            },
          ],
        },
        payments: {
          create: {
            id: uuid(),
            method: PaymentMethod.DEBIT_CARD,
            amount: new Prisma.Decimal(total3),
            status: PaymentStatus.PAID,
            paidAt: new Date(),
            transactionId: `DEBIT-BCA-98765`,
          },
        },
      },
    });

    // Update table 3 to OCCUPIED
    if (tables[2]) {
      await prisma.table.update({
        where: { id: tables[2].id },
        data: { status: 'OCCUPIED', currentOrderId: order3.id },
      });
    }
  }
}
