// prisma/seed.js
// Run with: npx prisma db seed

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Use bcryptjs for better compatibility

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

  // Create sample categories
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
    },
    {
      nameEn: 'Food',
      nameAr: 'طعام',
      descriptionEn: 'Food items and consumables',
      descriptionAr: 'المواد الغذائية والمواد الاستهلاكية'
    }
  ];

  const categories = [];
  for (const catData of categoryData) {
    const category = await prisma.category.upsert({
      where: { nameEn: catData.nameEn },
      update: {},
      create: catData
    });
    categories.push(category);
  }

  console.log('✅ Categories created:', categories.length);

  // Create sample products with decimal values
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
    const product = await prisma.product.upsert({
      where: { sku: prodData.sku },
      update: {},
      create: prodData
    });
    products.push(product);
  }

  console.log('✅ Products created:', products.length);

  // Create sample customer
  const customer = await prisma.customer.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      nameEn: 'John Doe',
      nameAr: 'جون دو',
      phone: '+1234567890',
      email: 'john@example.com',
      address: '123 Main St, City'
    }
  });

  console.log('✅ Sample customer created:', customer.nameEn);

  // Create sample supplier
  const supplier = await prisma.supplier.upsert({
    where: { email: 'supplier@techcorp.com' },
    update: {},
    create: {
      nameEn: 'TechCorp Suppliers',
      nameAr: 'موردين تك كورب',
      phone: '+1-555-0100',
      email: 'supplier@techcorp.com',
      address: '123 Supplier Street, Business District'
    }
  });

  console.log('✅ Sample supplier created:', supplier.nameEn);

  // Add inventory history for all products
  for (const product of products) {
    if (product.quantity > 0) {
      const existingHistory = await prisma.inventoryHistory.findFirst({
        where: { 
          productId: product.id,
          action: 'INITIAL_STOCK'
        }
      });

      if (!existingHistory) {
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
  }

  console.log('✅ Inventory history created');

  // Create sample settings
  const defaultSettings = [
    { key: 'companyNameEn', value: 'Inventory Pro', type: 'STRING' },
    { key: 'companyNameAr', value: 'نظام المخزون', type: 'STRING' },
    { key: 'defaultCurrency', value: 'IQD', type: 'STRING' },
    { key: 'lowStockThreshold', value: '10', type: 'NUMBER' },
    { key: 'autoBackup', value: 'true', type: 'BOOLEAN' }
  ];

  for (const setting of defaultSettings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting
    });
  }

  console.log('✅ Default settings created');

  // Create predefined expense categories
  const expenseCategories = [
    {
      nameEn: 'Fuel & Gas',
      nameAr: 'وقود وغاز',
      isSystem: true
    },
    {
      nameEn: 'Food & Meals',
      nameAr: 'طعام ووجبات',
      isSystem: true
    },
    {
      nameEn: 'Vehicle & Car Expenses',
      nameAr: 'مصاريف المركبات والسيارات',
      isSystem: true
    },
    {
      nameEn: 'General Operational Expenses',
      nameAr: 'المصاريف التشغيلية العامة',
      isSystem: true
    }
  ];

  for (const category of expenseCategories) {
    await prisma.expenseCategory.upsert({
      where: { nameEn: category.nameEn },
      update: {},
      create: category
    });
  }

  console.log('✅ Expense categories created:', expenseCategories.length);

  // Create default account types
  const accountTypes = [
    {
      nameEn: 'Employee Accounts',
      nameAr: 'حسابات الموظفين',
      code: 'EMP'
    },
    {
      nameEn: 'Expense Accounts',
      nameAr: 'حسابات المصروفات',
      code: 'EXP'
    },
    {
      nameEn: 'Asset Accounts',
      nameAr: 'حسابات الأصول',
      code: 'AST'
    },
    {
      nameEn: 'Liability Accounts',
      nameAr: 'حسابات الخصوم',
      code: 'LIB'
    }
  ];

  for (const accountType of accountTypes) {
    await prisma.accountType.upsert({
      where: { code: accountType.code },
      update: {},
      create: accountType
    });
  }

  console.log('✅ Account types created:', accountTypes.length);

  // Create sample employees
  const employees = [
    {
      nameEn: 'Ahmed Hassan',
      nameAr: 'أحمد حسن',
      email: 'ahmed@company.com',
      phone: '+964-770-123-4567',
      position: 'Store Manager',
      salary: 1500.00
    },
    {
      nameEn: 'Fatima Ali',
      nameAr: 'فاطمة علي',
      email: 'fatima@company.com',
      phone: '+964-770-234-5678',
      position: 'Sales Associate',
      salary: 800.00
    }
  ];

  for (const employee of employees) {
    await prisma.employee.upsert({
      where: { email: employee.email },
      update: {},
      create: employee
    });
  }

  console.log('✅ Sample employees created:', employees.length);

  console.log(`
🎉 Database setup complete!

👤 Admin Login:
   Email: admin@inventory.com
   Password: admin123

📊 Sample Data Created:
   - ${categories.length} product categories
   - ${products.length} products
   - 1 customer
   - 1 supplier
   - ${expenseCategories.length} expense categories
   - ${accountTypes.length} account types
   - ${employees.length} sample employees
   - Inventory history records
   - Default settings

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