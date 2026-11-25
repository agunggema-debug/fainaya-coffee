// Seed data for Faianaya Coffee - Categories and Products
import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

// ============================================================
// CATEGORIES
// ============================================================

export async function seedCategories(branches: any[]) {
  const categoryTemplates = [
    { name: 'Espresso & Coffee Panas' },
    { name: 'Iced Coffee & Cold Brew' },
    { name: 'Manual Brew Single Origin' },
    { name: 'Non-Coffee Specials' },
    { name: 'Pastry & Bakery' },
    { name: 'Makanan Utama (Food)' },
  ];

  for (const branch of branches) {
    for (const cat of categoryTemplates) {
      const existing = await prisma.category.findFirst({
        where: { branchId: branch.id, name: cat.name },
      });
      if (!existing) {
        await prisma.category.create({
          data: {
            id: uuid(),
            branchId: branch.id,
            name: cat.name,
            isActive: true,
          },
        });
      }
    }
  }
}

// ============================================================
// PRODUCTS
// ============================================================

export async function seedProducts(branches: any[]) {
  const productTemplates = [
    // 1. Espresso & Coffee Panas
    {
      category: 'Espresso & Coffee Panas',
      name: 'Single Espresso',
      sku: 'ESP-001',
      basePrice: 15000,
      sellingPrice: 18000,
      costPrice: 4500,
      station: 'barista',
      prepTimeMin: 3,
      barcode: '8990001001',
    },
    {
      category: 'Espresso & Coffee Panas',
      name: 'Hot Americano',
      sku: 'AMR-001',
      basePrice: 18000,
      sellingPrice: 22000,
      costPrice: 5000,
      station: 'barista',
      prepTimeMin: 4,
      barcode: '8990001002',
    },
    {
      category: 'Espresso & Coffee Panas',
      name: 'Hot Cappuccino',
      sku: 'CAP-001',
      basePrice: 22000,
      sellingPrice: 26000,
      costPrice: 8000,
      station: 'barista',
      prepTimeMin: 5,
      barcode: '8990001003',
    },
    {
      category: 'Espresso & Coffee Panas',
      name: 'Caffe Latte',
      sku: 'LAT-001',
      basePrice: 22000,
      sellingPrice: 26000,
      costPrice: 8000,
      station: 'barista',
      prepTimeMin: 5,
      barcode: '8990001004',
    },
    {
      category: 'Espresso & Coffee Panas',
      name: 'Piccolo Latte',
      sku: 'PIC-001',
      basePrice: 20000,
      sellingPrice: 24000,
      costPrice: 7000,
      station: 'barista',
      prepTimeMin: 4,
      barcode: '8990001005',
    },

    // 2. Iced Coffee & Cold Brew
    {
      category: 'Iced Coffee & Cold Brew',
      name: 'Iced Americano',
      sku: 'ICE-AMR-001',
      basePrice: 20000,
      sellingPrice: 24000,
      costPrice: 6000,
      station: 'barista',
      prepTimeMin: 4,
      barcode: '8990002001',
    },
    {
      category: 'Iced Coffee & Cold Brew',
      name: 'Iced Caffe Latte',
      sku: 'ICE-LAT-001',
      basePrice: 24000,
      sellingPrice: 28000,
      costPrice: 8500,
      station: 'barista',
      prepTimeMin: 5,
      barcode: '8990002002',
    },
    {
      category: 'Iced Coffee & Cold Brew',
      name: 'Iced Caramel Macchiato',
      sku: 'ICE-CRM-001',
      basePrice: 28000,
      sellingPrice: 32000,
      costPrice: 10000,
      station: 'barista',
      prepTimeMin: 6,
      barcode: '8990002003',
    },
    {
      category: 'Iced Coffee & Cold Brew',
      name: 'Fainaya Cold Brew Reserve',
      sku: 'CLD-001',
      basePrice: 25000,
      sellingPrice: 30000,
      costPrice: 9000,
      station: 'barista',
      prepTimeMin: 2,
      barcode: '8990002004',
    },

    // 3. Manual Brew Single Origin
    {
      category: 'Manual Brew Single Origin',
      name: 'V60 Aceh Gayo Anaerob',
      sku: 'MB-V60-001',
      basePrice: 28000,
      sellingPrice: 35000,
      costPrice: 12000,
      station: 'barista',
      prepTimeMin: 8,
      barcode: '8990003001',
    },
    {
      category: 'Manual Brew Single Origin',
      name: 'Japanese Drip Toraja Sapan',
      sku: 'MB-JAP-001',
      basePrice: 30000,
      sellingPrice: 37000,
      costPrice: 13000,
      station: 'barista',
      prepTimeMin: 8,
      barcode: '8990003002',
    },

    // 4. Non-Coffee Specials
    {
      category: 'Non-Coffee Specials',
      name: 'Ice Matcha Latte Uji',
      sku: 'NNC-MTC-001',
      basePrice: 26000,
      sellingPrice: 30000,
      costPrice: 9500,
      station: 'barista',
      prepTimeMin: 5,
      barcode: '8990004001',
    },
    {
      category: 'Non-Coffee Specials',
      name: 'Signature Chocolate Latte',
      sku: 'NNC-CHO-001',
      basePrice: 24000,
      sellingPrice: 28000,
      costPrice: 8500,
      station: 'barista',
      prepTimeMin: 5,
      barcode: '8990004002',
    },

    // 5. Pastry & Bakery
    {
      category: 'Pastry & Bakery',
      name: 'Butter Croissant Premium',
      sku: 'PST-CRO-001',
      basePrice: 18000,
      sellingPrice: 23000,
      costPrice: 8000,
      station: 'kitchen',
      prepTimeMin: 4,
      barcode: '8990005001',
    },
    {
      category: 'Pastry & Bakery',
      name: 'Pain au Chocolat',
      sku: 'PST-PAC-001',
      basePrice: 20000,
      sellingPrice: 25000,
      costPrice: 9000,
      station: 'kitchen',
      prepTimeMin: 4,
      barcode: '8990005002',
    },
    {
      category: 'Pastry & Bakery',
      name: 'Dark Chocolate Brownie Chunk',
      sku: 'PST-BRW-001',
      basePrice: 15000,
      sellingPrice: 20000,
      costPrice: 6000,
      station: 'kitchen',
      prepTimeMin: 3,
      barcode: '8990005003',
    },

    // 6. Makanan Utama
    {
      category: 'Makanan Utama (Food)',
      name: 'Nasi Goreng Spesial Fainaya',
      sku: 'FOD-NAS-001',
      basePrice: 32000,
      sellingPrice: 38000,
      costPrice: 14000,
      station: 'kitchen',
      prepTimeMin: 12,
      barcode: '8990006001',
    },
    {
      category: 'Makanan Utama (Food)',
      name: 'Spaghetti Aglio Olio Smoked Beef',
      sku: 'FOD-SPG-001',
      basePrice: 34000,
      sellingPrice: 40000,
      costPrice: 15000,
      station: 'kitchen',
      prepTimeMin: 10,
      barcode: '8990006002',
    },
    {
      category: 'Makanan Utama (Food)',
      name: 'Crispy French Fries Mayo',
      sku: 'FOD-FFR-001',
      basePrice: 18000,
      sellingPrice: 22000,
      costPrice: 7000,
      station: 'kitchen',
      prepTimeMin: 7,
      barcode: '8990006003',
    },
  ];

  for (const branch of branches) {
    const categories = await prisma.category.findMany({
      where: { branchId: branch.id },
    });
    const catMap = new Map(categories.map((c) => [c.name, c.id]));

    for (const item of productTemplates) {
      const branchSku = `${item.sku}-${branch.code.split('-')[0]}`;
      const branchBarcode = `${item.barcode}${branch.code === 'MAIN-001' ? '1' : '2'}`;

      const existing = await prisma.product.findFirst({
        where: { branchId: branch.id, name: item.name },
      });

      if (!existing) {
        await prisma.product.create({
          data: {
            id: uuid(),
            branchId: branch.id,
            categoryId: catMap.get(item.category) || null,
            name: item.name,
            sku: branchSku,
            barcode: branchBarcode,
            basePrice: item.basePrice,
            sellingPrice: item.sellingPrice,
            costPrice: item.costPrice,
            station: item.station,
            prepTimeMin: item.prepTimeMin,
            isAvailable: true,
            isPopular: item.name.includes('Latte') || item.name.includes('Croissant'),
          },
        });
      }
    }
  }
}
