import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '../../../utils/verifyIdToken';
import { getUserByUid, createOrUpdateUser, User } from '../../../services/users';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await verifyIdToken(token);
    
    // Get user data from Firestore
    const user = await getUserByUid(decodedToken.uid);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      uid: user.uid,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('Error verifying token:', error);
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
