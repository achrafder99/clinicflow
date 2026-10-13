import { pool } from '../config/db';
import { hashPassword } from '../services/auth.service';

const [email, password, role = 'staff', fullName = 'Test User'] = process.argv.slice(2);

async function run() {
  if (!email || !password) {
    console.error('Usage: npm run create-user -- <email> <password> [admin|staff] [fullName]');
    process.exit(1);
  }
  await pool.query(
    'INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, lower($2), $3, $4)',
    [fullName, email, await hashPassword(password), role]
  );
  console.log(`created ${role}: ${email}`);
  await pool.end();
}

run();