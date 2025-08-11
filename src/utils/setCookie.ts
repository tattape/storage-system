// utils/setCookie.ts
import { serialize } from 'cookie';
import { NextResponse } from 'next/server';

export function setTokenCookie(res: NextResponse, token: string) {
  res.headers.append('Set-Cookie', serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  }));
}

export function clearTokenCookie(res: NextResponse) {
  res.headers.append('Set-Cookie', serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  }));
}
