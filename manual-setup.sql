-- Manual database setup script for SQLite
-- This creates the minimal schema needed for login

-- Create User table
CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'EMPLOYEE',
    preferredLanguage TEXT NOT NULL DEFAULT 'ar',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert admin user with bcryptjs hashed password
-- Password: admin123
-- Hash: $2a$10$WiHbFttVNRd58WZkr.afsuYfrEam7g5rDt..WJrEtgebm9TjNr6Jm
INSERT OR REPLACE INTO User (id, email, password, name, role, preferredLanguage)
VALUES (
    'admin_user_001',
    'admin@inventory.com',
    '$2a$10$WiHbFttVNRd58WZkr.afsuYfrEam7g5rDt..WJrEtgebm9TjNr6Jm',
    'System Administrator',
    'ADMIN',
    'ar'
);

-- Verify the user was created
SELECT 'Admin user created successfully!' as message,
       email, name, role
FROM User
WHERE email = 'admin@inventory.com';
