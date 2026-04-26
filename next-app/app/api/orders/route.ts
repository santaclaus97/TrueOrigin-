import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import UniqueCode from '@/models/UniqueCode';
import Product from '@/models/Product';
import { protect } from '@/lib/middleware';

export async function POST(req: Request) {
  try {
    const authResult = await protect(req);
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    await dbConnect();
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ message: 'No product ID provided' }, { status: 400 });
    }

    // Find an available unique code for this product
    const uniqueCodeDoc = await UniqueCode.findOne({ 
      productId, 
      isLocked: false 
    });

    if (!uniqueCodeDoc) {
      return NextResponse.json({ message: 'Product is sold out or no codes available' }, { status: 404 });
    }

    // Lock the code to this user
    uniqueCodeDoc.firstBuyer = authResult.user._id;
    uniqueCodeDoc.isLocked = true;
    await uniqueCodeDoc.save();

    const order = new Order({
      buyer: authResult.user._id,
      uniqueCode: uniqueCodeDoc._id,
      isResale: false,
    });

    const createdOrder = await order.save();

    const populatedOrder = await Order.findById(createdOrder._id)
      .populate({
        path: 'uniqueCode',
        populate: { path: 'productId', select: 'name description' }
      });

    return NextResponse.json(populatedOrder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
