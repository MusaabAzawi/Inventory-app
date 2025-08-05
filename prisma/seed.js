// scripts/setup.ts
// Run with: npx tsx scripts/setup.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Setting up database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@inventory.com' },
    update: {},
    create: {
      email: 'admin@inventory.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      preferredLanguage: 'ar'
    }
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create sample categories (using findFirst + create pattern since unique constraints may not be applied yet)
  const categoryData = [
    {
      nameEn: 'Electronics',
      nameAr: 'إلكترونيات',
      descriptionEn: 'Electronic devices and accessories',
      descriptionAr: 'الأجهزة الإلكترونية والإكسسوارات'
    },
    {
      nameEn: 'Office Supplies',
      nameAr: 'مستلزمات مكتبية',
      descriptionEn: 'Office and stationery items',
      descriptionAr: 'أدوات مكتبية وقرطاسية'
    },
    {
      nameEn: 'Clothing',
      nameAr: 'ملابس',
      descriptionEn: 'Apparel and fashion items',
      descriptionAr: 'ملابس وأزياء'
    }
  ];

  const categories = [];
  for (const catData of categoryData) {
    // Check if category already exists
    let category = await prisma.category.findFirst({
      where: { nameEn: catData.nameEn }
    });
    
    if (!category) {
      category = await prisma.category.create({
        data: catData
      });
    }
    categories.push(category);
  }

  console.log('✅ Categories created:', categories.length);

  // Create sample products
  const productData = [
    {
      nameEn: 'Gaming Laptop',
      nameAr: 'لابتوب ألعاب',
      sku: 'LAPTOP-001',
      barcode: '1234567890123',
      quantity: 15,
      minQuantity: 5,
      costPrice: 800.00,
      sellingPrice: 1200.00,
      categoryId: categories[0].id,
      location: 'Shelf A1'
    },
    {
      nameEn: 'Wireless Mouse',
      nameAr: 'فأرة لاسلكية',
      sku: 'MOUSE-001',
      barcode: '1234567890124',
      quantity: 50,
      minQuantity: 10,
      costPrice: 25.00,
      sellingPrice: 45.00,
      categoryId: categories[0].id,
      location: 'Shelf A2'
    },
    {
      nameEn: 'Blue Ink Pen',
      nameAr: 'قلم حبر أزرق',
      sku: 'PEN-001',
      barcode: '1234567890125',
      quantity: 2,
      minQuantity: 10,
      costPrice: 0.50,
      sellingPrice: 1.50,
      categoryId: categories[1].id,
      location: 'Shelf B1'
    },
    {
      nameEn: 'Cotton T-Shirt',
      nameAr: 'تيشيرت قطني',
      sku: 'SHIRT-001',
      quantity: 0,
      minQuantity: 5,
      costPrice: 12.00,
      sellingPrice: 25.00,
      categoryId: categories[2].id,
      location: 'Shelf C1'
    }
  ];

  const products = [];
  for (const prodData of productData) {
    // Check if product already exists
    let product = await prisma.product.findFirst({
      where: { sku: prodData.sku }
    });
    
    if (!product) {
      product = await prisma.product.create({
        data: prodData
      });
    }
    products.push(product);
  }

  console.log('✅ Products created:', products.length);

  // Create sample customer
  let customer = await prisma.customer.findFirst({
    where: { email: 'john@example.com' }
  });
  
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        nameEn: 'John Doe',
        nameAr: 'جون دو',
        phone: '+1234567890',
        email: 'john@example.com',
        address: '123 Main St, City'
      }
    });
  }

  console.log('✅ Sample customer created:', customer.nameEn);

  // Add inventory history for all products
  for (const product of products) {
    // Check if inventory history already exists for this product
    const existingHistory = await prisma.inventoryHistory.findFirst({
      where: { 
        productId: product.id,
        action: 'INITIAL_STOCK'
      }
    });
    
    if (!existingHistory && product.quantity > 0) {
      await prisma.inventoryHistory.create({
        data: {
          productId: product.id,
          userId: adminUser.id,
          action: 'INITIAL_STOCK',
          previousQuantity: 0,
          newQuantity: product.quantity,
          quantityChange: product.quantity,
          reason: 'Initial setup'
        }
      });
    }
  }

  console.log('✅ Inventory history created');

  console.log(`
🎉 Database setup complete!

👤 Admin Login:
   Email: admin@inventory.com
   Password: admin123

📊 Sample Data Created:
   - ${categories.length} categories
   - ${products.length} products
   - 1 customer
   - Inventory history records

🚀 You can now run: npm run dev
  `);
}

main()
  .catch((e) => {
    console.error('❌ Setup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });