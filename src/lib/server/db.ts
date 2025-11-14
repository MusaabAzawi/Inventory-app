// TEMPORARY FIX: Using better-sqlite3 directly instead of Prisma
// because Prisma engines cannot be downloaded in this environment
import Database from 'better-sqlite3';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Open database connection
const db = new Database(join(process.cwd(), 'prisma', 'dev.db'));

// Create a Prisma-like API for User model
const userModel = {
  findUnique: async ({ where }: { where: { id?: string; email?: string } }) => {
    let query: string;
    let value: string;

    if (where.id) {
      query = 'SELECT * FROM User WHERE id = ?';
      value = where.id;
    } else if (where.email) {
      query = 'SELECT * FROM User WHERE email = ?';
      value = where.email;
    } else {
      return null;
    }

    const user = db.prepare(query).get(value) as any;

    if (!user) return null;

    // Convert dates from ISO strings to Date objects to match Prisma's behavior
    return {
      ...user,
      createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date()
    };
  },

  update: async ({ where, data }: { where: { id?: string; email?: string }, data: any }) => {
    const fields = Object.keys(data);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => data[f]);

    let whereClause: string;
    let whereValue: string;

    if (where.id) {
      whereClause = 'id = ?';
      whereValue = where.id;
    } else if (where.email) {
      whereClause = 'email = ?';
      whereValue = where.email;
    } else {
      throw new Error('Must provide id or email in where clause');
    }

    const query = `UPDATE User SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE ${whereClause}`;
    db.prepare(query).run(...values, whereValue);

    // Return the updated user
    return userModel.findUnique({ where });
  }
};

// Export a Prisma-like client
export const prisma = {
  user: userModel,
  $disconnect: async () => {
    db.close();
  }
};