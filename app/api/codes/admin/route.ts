import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import UniqueCode from '@/models/UniqueCode';
import { protect, admin } from '@/lib/middleware';

export async function GET(req: Request) {
  try {
    const authResult = await protect(req);
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    if (!admin(authResult.user)) {
      return NextResponse.json({ message: 'Not authorized as an admin' }, { status: 401 });
    }

    await dbConnect();
    const products = await Product.find({ manufacturer: authResult.user._id });
    const productIds = products.map(p => p._id);

    const codes = await UniqueCode.find({ productId: { $in: productIds } })
      .populate('productId', 'name')
      .populate('firstBuyer', 'name email');

    return NextResponse.json(codes);
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
