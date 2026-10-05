// src/lib/auth.ts
import 'server-only';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'screener_session';

// --- Native Crypto Password Hashing (Zero Dependencies) ---
function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

function verifyPassword(password: string, combinedHash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = combinedHash.split(':');
    if (!salt || !key) return resolve(false);

    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey));
    });
  });
}
// -----------------------------------------------------------

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionUserId) return null;

  const users = await sql`
    SELECT id, email, created_at 
    FROM users 
    WHERE id = ${sessionUserId}
    LIMIT 1
  `;

  return users[0] || null;
}

export async function loginUser(email: string, plainTextPass: string) {
  const users = await sql`
    SELECT id, email, password_hash 
    FROM users 
    WHERE email = ${email}
    LIMIT 1
  `;

  if (users.length === 0) {
    throw new Error('Invalid email or password.');
  }

  const user = users[0];
  const isValid = await verifyPassword(plainTextPass, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid email or password.');
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return { id: user.id, email: user.email };
}

export async function registerUser(email: string, plainTextPass: string) {
  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length > 0) {
    throw new Error('User already exists with this email.');
  }

  const passwordHash = await hashPassword(plainTextPass);

  const inserted = await sql`
    INSERT INTO users (email, password_hash)
    VALUES (${email}, ${passwordHash})
    RETURNING id, email
  `;

  const user = inserted[0];
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return user;
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}