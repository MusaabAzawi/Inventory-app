import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const electronics = await prisma.category.create({
    data: {
      nameEn: 'Electronics',
      nameAr: 'إلكترونيات',
    }
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@inventory.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
      preferredLanguage: 'ar'
    }
  });

  // Create sample product
  await prisma.product.create({
    data: {
      nameEn: 'Laptop',
      nameAr: 'لابتوب',
      sku: 'LAP001',
      barcode: '1234567890',
      quantity: 10,
      minQuantity: 5,
      costPrice: 500,
      sellingPrice: 750,
      categoryId: electronics.id,
      location: 'A1'
    }
  });

  console.log('Database seeded!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
