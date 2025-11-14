# 🚀 Setup Instructions

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
```

The default `.env` uses SQLite (file-based database), which works out of the box.

### 3. Set Up Database
```bash
# Run migrations to create database schema
npx prisma migrate dev

# Seed the database with initial data
npx prisma db seed
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Login
Navigate to `http://localhost:5173/auth/login` and use:

- **Email:** `admin@inventory.com`
- **Password:** `admin123`

---

## Database Options

### SQLite (Default - Recommended for Development)
Already configured in `.env.example`:
```env
DATABASE_URL="file:./prisma/dev.db"
```

### PostgreSQL (Production)
Update your `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/inventory_db?schema=public"
```

Then run:
```bash
npx prisma migrate dev
npx prisma db seed
```

---

## Troubleshooting

### Can't Login?
If you can't login with the default credentials:

1. **Reset the database:**
   ```bash
   rm prisma/dev.db  # For SQLite only
   npx prisma migrate dev
   npx prisma db seed
   ```

2. **Check seed output:**
   The seed script should show:
   ```
   ✅ Admin user created: admin@inventory.com
   ```

3. **Verify user in database:**
   ```bash
   npx prisma studio
   ```
   Open the `User` table and check if admin exists.

### Database Issues?
```bash
# Reset everything
npx prisma migrate reset

# This will:
# - Drop the database
# - Run all migrations
# - Run seed automatically
```

---

## Default Admin Credentials

**Email:** admin@inventory.com
**Password:** admin123

**⚠️ Important:** Change the admin password after first login in production!

---

## What Gets Created During Seed?

- ✅ Admin user (admin@inventory.com)
- ✅ 4 product categories
- ✅ 4 sample products
- ✅ 1 customer
- ✅ 1 supplier
- ✅ 4 expense categories
- ✅ 4 account types
- ✅ 2 sample employees
- ✅ Default settings

---

## Useful Commands

```bash
# Database management
npm run prisma:migrate    # Run migrations
npm run prisma:seed       # Seed database
npm run prisma:studio     # Open Prisma Studio (database GUI)

# Development
npm run dev               # Start dev server
npm run build             # Build for production
npm run preview           # Preview production build
```
