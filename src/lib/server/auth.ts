import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createSessionToken(userId: string): string {
  // Simple token for now - in production use JWT
  return Buffer.from(`${userId}:${Date.now()}`).toString('base64');
}

export function validateSessionToken(token: string): { userId: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [userId, timestamp] = decoded.split(':');
    
    // Check if token is less than 7 days old
    const tokenAge = Date.now() - parseInt(timestamp);
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    
    if (tokenAge < sevenDays) {
      return { userId };
    }
  } catch {
    // Invalid token
  }
  return null;
}