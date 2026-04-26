import jwt from 'jsonwebtoken';
import User from '@/models/User';
import dbConnect from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export async function protect(req: Request): Promise<{ user: any; error?: never; status?: never } | { user?: never; error: string; status: number }> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Not authorized, no token', status: 401 };
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    await dbConnect();
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return { error: 'User not found', status: 401 };
    }

    return { user };
  } catch {
    return { error: 'Not authorized, token failed', status: 401 };
  }
}

export function admin(user: { role?: string } | null) {
  if (user && user.role === 'admin') {
    return true;
  }
  return false;
}
