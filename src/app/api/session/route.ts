
import { NextRequest, NextResponse } from 'next/server';
import { setTokenCookie, clearTokenCookie } from '../../../utils/setCookie';
import { verifyIdToken } from '../../../utils/verifyIdToken';

export async function GET(request: NextRequest) {
  try {
    console.log('Session API called');
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    console.log('Token found:', !!token);
    
    if (!token) {
      console.log('No token in cookies');
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    // Verify token and get user info
    const decodedToken = await verifyIdToken(token);
    console.log('Token verified for user:', decodedToken.email);
    
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
  console.log('Session POST called');
  const { token } = await req.json();
  console.log('Received token:', !!token);
  
  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 400 });
  }
  
  const res = NextResponse.json({ success: true });
  setTokenCookie(res, token);
  console.log('Token cookie set');
  return res;
}


export async function DELETE() {
  const res = NextResponse.json({ success: true });
  clearTokenCookie(res);
  return res;
}
