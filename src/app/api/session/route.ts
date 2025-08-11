
import { NextRequest, NextResponse } from 'next/server';
import { setTokenCookie, clearTokenCookie } from '../../../utils/setCookie';


export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 400 });
  }
  const res = NextResponse.json({ success: true });
  setTokenCookie(res, token);
  return res;
}


export async function DELETE() {
  const res = NextResponse.json({ success: true });
  clearTokenCookie(res);
  return res;
}
