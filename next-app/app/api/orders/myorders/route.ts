import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { protect } from '@/lib/middleware';

export async function GET(req: Request) {
  try {
    const authResult = await protect(req);
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    await dbConnect();
    const orders = await Order.find({ buyer: authResult.user._id })
      .populate({
        path: 'uniqueCode',
        select: 'code retailerInfo isLocked',
        populate: { 
          path: 'productId', 
          populate: { path: 'manufacturer', select: 'name' } 
        }
      })
      .sort({ purchaseDate: -1 });

    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
