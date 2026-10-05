// src/app/actions/auth.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'screener_session';

// --- Native Crypto Helpers (Zero external dependencies) ---
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
  return new Promise((resolve) => {
    const [salt, key] = combinedHash.split(':');
    if (!salt || !key) return resolve(false);

    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return resolve(false);
      const keyBuffer = Buffer.from(key, 'hex');
      if (keyBuffer.length !== derivedKey.length) return resolve(false);
      resolve(crypto.timingSafeEqual(keyBuffer, derivedKey));
    });
  });
}

// --- Auth Actions ---

export async function loginAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  try {
    const users = await sql`
      SELECT id, email, password_hash 
      FROM public.users 
      WHERE email = ${email} 
      LIMIT 1
    `;

    if (users.length === 0) {
      return { error: 'Invalid email or password.' };
    }

    const user = users[0];
    const isValid = await verifyPassword(password, user.password_hash);
    
    if (!isValid) {
      return { error: 'Invalid email or password.' };
    }

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
  } catch (err: any) {
    console.error('Login action error:', err);
    return { error: err.message || 'An unexpected database error occurred.' };
  }

  redirect('/');
}

export async function registerAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  try {
    const existing = await sql`
      SELECT id FROM public.users WHERE email = ${email} LIMIT 1
    `;

    if (existing.length > 0) {
      return { error: 'An account with this email already exists.' };
    }

    const passwordHash = await hashPassword(password);

    const inserted = await sql`
      INSERT INTO public.users (email, password_hash)
      VALUES (${email}, ${passwordHash})
      RETURNING id
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
  } catch (err: any) {
    console.error('Registration action error:', err);
    return { error: err.message || 'Could not register user.' };
  }

  redirect('/');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect('/login');
}