-- Add fake members for testing dashboard statistics
-- Run this in your database client or through Prisma Studio

-- Insert fake users
INSERT INTO "User" (login_id, password, username, email, account_type, email_verified, created_at, updated_at)
VALUES 
  ('MEM-ABC123', '$2b$10$YourHashedPasswordHere', 'John Doe', 'john.doe@example.com', 'MEMBER', true, NOW(), NOW()),
  ('MEM-DEF456', '$2b$10$YourHashedPasswordHere', 'Jane Smith', 'jane.smith@example.com', 'MEMBER', true, NOW(), NOW()),
  ('MEM-GHI789', '$2b$10$YourHashedPasswordHere', 'Bob Johnson', 'bob.johnson@example.com', 'MEMBER', true, NOW(), NOW()),
  ('MEM-JKL012', '$2b$10$YourHashedPasswordHere', 'Alice Brown', 'alice.brown@example.com', 'MEMBER', true, NOW(), NOW()),
  ('MEM-MNO345', '$2b$10$YourHashedPasswordHere', 'Charlie Wilson', 'charlie.wilson@example.com', 'MEMBER', true, NOW(), NOW())
ON CONFLICT (login_id) DO NOTHING;

-- Insert corresponding members
INSERT INTO "Member" (user_id, join_date, status, max_borrowed_books)
SELECT 
  u.user_id,
  NOW() - INTERVAL '30 days' * RANDOM(),
  'active',
  5
FROM "User" u
WHERE u.account_type = 'MEMBER' 
  AND u.login_id IN ('MEM-ABC123', 'MEM-DEF456', 'MEM-GHI789', 'MEM-JKL012', 'MEM-MNO345')
  AND NOT EXISTS (SELECT 1 FROM "Member" m WHERE m.user_id = u.user_id);

-- Note: This is a simplified version. In production, you should:
-- 1. Generate proper bcrypt hashes for passwords
-- 2. Use a migration or seed script
-- 3. Handle relationships properly

-- To see the stats:
SELECT 
  (SELECT COUNT(*) FROM "Book") as total_books,
  (SELECT COUNT(*) FROM "Member" m JOIN "User" u ON m.user_id = u.user_id WHERE u.email_verified = true) as active_members,
  (SELECT COUNT(*) FROM "Loan" WHERE status IN ('ongoing', 'overdue')) as active_loans,
  (SELECT COUNT(*) FROM "Loan" WHERE status = 'returned') as completed_loans;
