import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '../../../utils/verifyIdToken';
import { getUserByEmail, createOrUpdateUser, User } from '../../../services/users';

// Force dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await verifyIdToken(token);
    
    // Just use email to get user data (simple and reliable)
    if (!decodedToken.email) {
      return NextResponse.json({ error: 'No email in token' }, { status: 400 });
    }
    
    const user = await getUserByEmail(decodedToken.email);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      uid: decodedToken.uid,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('Error in /api/user:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await verifyIdToken(token);
    
    const body = await request.json();
    const { email, role } = body;

    if (!email || !role || !['owner', 'editor', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid email or role' }, { status: 400 });
    }

    // Create or update user
    const userData: User = {
      uid: decodedToken.uid,
      email: decodedToken.email || email,
      role: role as "owner" | "editor" | "member",
      createdAt: new Date(),
    };

    await createOrUpdateUser(userData);

    return NextResponse.json({ 
      message: 'User role updated successfully',
      user: userData 
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}
