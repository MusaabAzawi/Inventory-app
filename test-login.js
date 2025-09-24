// Simple test to check if login works
import bcrypt from 'bcrypt';

const password = 'admin123';
const hashedFromDB = '$2b$10$example'; // We'll get this from DB

async function testLogin() {
  // Test hashing
  const testHash = await bcrypt.hash(password, 10);
  console.log('Test hash:', testHash);

  // Test the actual hash from seed
  const seedHash = await bcrypt.hash(password, 10);
  console.log('Seed would create hash:', seedHash);

  // Check if bcrypt works
  const isValid = await bcrypt.compare(password, seedHash);
  console.log('Password validation test:', isValid);
}

testLogin();