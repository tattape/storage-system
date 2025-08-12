import { NextRequest, NextResponse } from 'next/server';
import { setTokenCookie, clearTokenCookie } from '../../../utils/setCookie';
import { verifyIdToken } from '../../../utils/verifyIdToken';

// Force dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    // Verify token and get user info
    const decodedToken = await verifyIdToken(token);
    
    return NextResponse.json({
      email: decodedToken.email,
      uid: decodedToken.uid,
      name: decodedToken.name,
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}

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
