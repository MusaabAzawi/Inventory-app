import bcrypt from 'bcrypt';
import { dev } from '$app/environment';

// In production, you should use environment variables for these
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key-here';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = dev ? 10 : 12; // More secure in production
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createSessionToken(userId: string): string {
  const timestamp = Date.now();
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));
  const randomString = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  
  // Create a more secure token structure
  const payload = {
    userId,
    timestamp,
    random: randomString,
    issued: new Date().toISOString()
  };
  
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function validateSessionToken(token: string): { userId: string; timestamp: number } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const payload = JSON.parse(decoded);
    
    if (!payload.userId || !payload.timestamp) {
      return null;
    }
    
    // Check if token is still valid
    const tokenAge = Date.now() - payload.timestamp;
    
    if (tokenAge < SESSION_DURATION && tokenAge >= 0) {
      return { 
        userId: payload.userId, 
        timestamp: payload.timestamp 
      };
    }
  } catch (error) {
    console.warn('Invalid session token:', error);
  }
  return null;
}

export function isSessionExpiringSoon(timestamp: number): boolean {
  const tokenAge = Date.now() - timestamp;
  const oneDay = 24 * 60 * 60 * 1000;
  return (SESSION_DURATION - tokenAge) < oneDay;
}

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkRateLimit(identifier: string, maxAttempts: number = 5): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);
  
  if (!attempt) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset counter if more than 1 hour has passed
  if (now - attempt.lastAttempt > 60 * 60 * 1000) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  if (attempt.count >= maxAttempts) {
    return false;
  }
  
  loginAttempts.set(identifier, { 
    count: attempt.count + 1, 
    lastAttempt: now 
  });
  
  return true;
}

export function clearRateLimit(identifier: string): void {
  loginAttempts.delete(identifier);
}