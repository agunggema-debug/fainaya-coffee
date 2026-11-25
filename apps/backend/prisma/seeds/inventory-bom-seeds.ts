// Seed data for Faianaya Coffee - Raw Materials, Inventory & BOM Recipes
import { PrismaClient, Prisma } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

export async function seedInventoryAndBOM(branches: any[]) {
  const rawMaterialTemplates = [
    {
      name: 'Bahan Baku: Biji Kopi Arabika Gayo (Roast Beans)',
      sku: 'RAW-KOP-GAYO',
      basePrice: 180000,
      sellingPrice: 0,
      costPrice: 180000,
      currentStock: 25.0, // 25 kg
      minStock: 5.0,
      unit: 'kg',
    },
    {
      name: 'Bahan Baku: Biji Kopi Robusta Dampit',
      sku: 'RAW-KOP-ROB',
      basePrice: 95000,
      sellingPrice: 0,
      costPrice: 95000,
      currentStock: 30.0, // 30 kg
      minStock: 8.0,
      unit: 'kg',
    },
    {
      name: 'Bahan Baku: Susu Segar Pasteurisasi Greenfield',
      sku: 'RAW-SUSU-PAS',
      basePrice: 22000,
      sellingPrice: 0,
      costPrice: 22000,
      currentStock: 60.0, // 60 liter
      minStock: 15.0,
      unit: 'liter',
    },
    {
      name: 'Bahan Baku: Sirup Karamel Monin Premium',
      sku: 'RAW-SRP-CRM',
      basePrice: 145000,
      sellingPrice: 0,
      costPrice: 145000,
      currentStock: 10.0, // 10 botol (700ml)
      minStock: 2.0,
      unit: 'botol',
    },
    {
      name: 'Bahan Baku: Bubuk Matcha Uji Kyoto Grade A',
      sku: 'RAW-MTC-UJI',
      basePrice: 350000,
      sellingPrice: 0,
      costPrice: 350000,
      currentStock: 5.0, // 5 kg
      minStock: 1.0,
      unit: 'kg',
    },
    {
      name: 'Kemasan: Paper Cup Hot 8oz & Lid',
      sku: 'PKG-CUP-HOT8',
      basePrice: 850,
      sellingPrice: 0,
      costPrice: 850,
      currentStock: 500, // 500 pcs
      minStock: 100,
      unit: 'pcs',
    },
    {
      name: 'Kemasan: Cold Cup 12oz & Strawless Lid',
      sku: 'PKG-CUP-COLD12',
      basePrice: 1100,
      sellingPrice: 0,
      costPrice: 1100,
      currentStock: 600, // 600 pcs
      minStock: 150,
      unit: 'pcs',
    },
    {
      name: 'Bahan Baku: Raw Dough Butter Croissant (Frozen)',
      sku: 'RAW-DGH-CRO',
      basePrice: 7500,
      sellingPrice: 0,
      costPrice: 7500,
      currentStock: 80, // 80 pcs
      minStock: 20,
      unit: 'pcs',
    },
  ];

  for (const branch of branches) {
    // 1. Create Raw Material Products & Inventory
    const ingredientMap: Record<string, string> = {};

    for (const raw of rawMaterialTemplates) {
      const branchSku = `${raw.sku}-${branch.code.split('-')[0]}`;
      let prod = await prisma.product.findFirst({
        where: { branchId: branch.id, sku: branchSku },
      });

      if (!prod) {
        prod = await prisma.product.create({
          data: {
            id: uuid(),
            branchId: branch.id,
            name: raw.name,
            sku: branchSku,
            basePrice: raw.basePrice,
            sellingPrice: raw.sellingPrice,
            costPrice: raw.costPrice,
            station: 'inventory',
            isAvailable: true,
          },
        });
      }

      ingredientMap[raw.sku] = prod.id;

      // Ensure Inventory record exists
      const invExisting = await prisma.inventory.findFirst({
        where: { branchId: branch.id, productId: prod.id },
      });

      if (!invExisting) {
        await prisma.inventory.create({
          data: {
            id: uuid(),
            branchId: branch.id,
            productId: prod.id,
            currentStock: new Prisma.Decimal(raw.currentStock),
            minStock: new Prisma.Decimal(raw.minStock),
            unit: raw.unit,
            lastCounted: new Date(),
          },
        });
      }
    }

    // 2. Link BOM Recipes to Menu Products
    const caffeLatte = await prisma.product.findFirst({
      where: { branchId: branch.id, name: 'Caffe Latte' },
    });
    if (caffeLatte && ingredientMap['RAW-KOP-GAYO'] && ingredientMap['RAW-SUSU-PAS']) {
      const existingBOM = await prisma.productIngredient.findFirst({
        where: { productId: caffeLatte.id },
      });
      if (!existingBOM) {
        await prisma.productIngredient.createMany({
          data: [
            {
              id: uuid(),
              productId: caffeLatte.id,
              ingredientId: ingredientMap['RAW-KOP-GAYO'],
              quantity: new Prisma.Decimal(0.018), // 18 gram biji kopi
              unit: 'kg',
              notes: 'Double shot espresso',
            },
            {
              id: uuid(),
              productId: caffeLatte.id,
              ingredientId: ingredientMap['RAW-SUSU-PAS'],
              quantity: new Prisma.Decimal(0.18), // 180ml susu
              unit: 'liter',
              notes: 'Steamed milk',
            },
            {
              id: uuid(),
              productId: caffeLatte.id,
              ingredientId: ingredientMap['PKG-CUP-HOT8'],
              quantity: new Prisma.Decimal(1),
              unit: 'pcs',
              notes: 'Cup 8oz takeaway/dinein',
            },
          ],
        });
      }
    }

    const iceCaramel = await prisma.product.findFirst({
      where: { branchId: branch.id, name: 'Iced Caramel Macchiato' },
    });
    if (iceCaramel && ingredientMap['RAW-KOP-GAYO'] && ingredientMap['RAW-SRP-CRM']) {
      const existingBOM = await prisma.productIngredient.findFirst({
        where: { productId: iceCaramel.id },
      });
      if (!existingBOM) {
        await prisma.productIngredient.createMany({
          data: [
            {
              id: uuid(),
              productId: iceCaramel.id,
              ingredientId: ingredientMap['RAW-KOP-GAYO'],
              quantity: new Prisma.Decimal(0.018),
              unit: 'kg',
            },
            {
              id: uuid(),
              productId: iceCaramel.id,
              ingredientId: ingredientMap['RAW-SUSU-PAS'],
              quantity: new Prisma.Decimal(0.15),
              unit: 'liter',
            },
            {
              id: uuid(),
              productId: iceCaramel.id,
              ingredientId: ingredientMap['RAW-SRP-CRM'],
              quantity: new Prisma.Decimal(0.02), // 20ml sirup
              unit: 'liter',
            },
            {
              id: uuid(),
              productId: iceCaramel.id,
              ingredientId: ingredientMap['PKG-CUP-COLD12'],
              quantity: new Prisma.Decimal(1),
              unit: 'pcs',
            },
          ],
        });
      }
    }

    const croissant = await prisma.product.findFirst({
      where: { branchId: branch.id, name: 'Butter Croissant Premium' },
    });
    if (croissant && ingredientMap['RAW-DGH-CRO']) {
      const existingBOM = await prisma.productIngredient.findFirst({
        where: { productId: croissant.id },
      });
      if (!existingBOM) {
        await prisma.productIngredient.create({
          data: {
            id: uuid(),
            productId: croissant.id,
            ingredientId: ingredientMap['RAW-DGH-CRO'],
            quantity: new Prisma.Decimal(1),
            unit: 'pcs',
            notes: 'Bake from frozen dough 18 mins',
          },
        });
      }
    }
  }
}
