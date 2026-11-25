// Seed data for Faianaya Coffee - Suppliers
import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

export async function seedSuppliers(branches: any[]) {
  const suppliers = [
    {
      name: 'CV Kopi Alam Nusantara (Roastery Partner)',
      contactPerson: 'Pak Hendra Gunawan',
      phone: '081288881111',
      email: 'sales@kopialam.co.id',
      address: 'Kawasan Industri Sentul Blok B2, Bogor',
      taxId: '01.234.567.8-404.000',
    },
    {
      name: 'PT Greenfield Dairy Fresh Indonesia',
      contactPerson: 'Ibu Ratna Susilowati',
      phone: '081288882222',
      email: 'order@greenfielddairy.id',
      address: 'Jl. Raya Cikarang Utama Kav. 12, Bekasi',
      taxId: '02.345.678.9-411.000',
    },
    {
      name: 'PT Kemasan Paper Eco Nusantara',
      contactPerson: 'Budi Hartono',
      phone: '081288883333',
      email: 'support@kemasaneco.com',
      address: 'Jl. Daan Mogot KM 19, Kalideres, Jakarta Barat',
      taxId: '03.456.789.0-422.000',
    },
  ];

  for (const branch of branches) {
    for (const sup of suppliers) {
      const existing = await prisma.supplier.findFirst({
        where: { branchId: branch.id, name: sup.name },
      });
      if (!existing) {
        await prisma.supplier.create({
          data: {
            id: uuid(),
            branchId: branch.id,
            ...sup,
            isActive: true,
          },
        });
      }
    }
  }
}
