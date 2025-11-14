// Manual database setup using better-sqlite3
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  console.log('🔧 Setting up database manually...\n');

  // Create or open database
  const db = new Database('./prisma/dev.db');
  console.log('✅ Database file created/opened');

  // Read SQL script
  const sql = readFileSync(join(__dirname, 'manual-setup.sql'), 'utf-8');

  // Execute SQL
  db.exec(sql);
  console.log('✅ Schema created and admin user inserted');

  // Verify user exists
  const user = db.prepare('SELECT email, name, role FROM User WHERE email = ?').get('admin@inventory.com');

  if (user) {
    console.log('\n✅ Admin user verified:');
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    console.log('\n🎉 Setup complete!');
    console.log('\nYou can now login with:');
    console.log('   Email: admin@inventory.com');
    console.log('   Password: admin123');
  } else {
    console.error('\n❌ Error: Admin user not found after setup!');
  }

  db.close();
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
