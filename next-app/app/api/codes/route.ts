import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import UniqueCode from '@/models/UniqueCode';
import { protect, admin } from '@/lib/middleware';
import crypto from 'crypto';

const generateRandomCode = () => {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
};

export async function POST(req: Request) {
  try {
    const authResult = await protect(req);
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    if (!admin(authResult.user)) {
      return NextResponse.json({ message: 'Not authorized as an admin' }, { status: 401 });
    }

    await dbConnect();
    const { productId, retailerInfo } = await req.json();

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    if (product.manufacturer.toString() !== authResult.user._id.toString()) {
      return NextResponse.json({ message: 'Not authorized, you do not own this product' }, { status: 401 });
    }

    let isUnique = false;
    let code = '';

    while (!isUnique) {
      code = generateRandomCode();
      const existingCode = await UniqueCode.findOne({ code });
      if (!existingCode) isUnique = true;
    }

    const uniqueCode = new UniqueCode({
      productId,
      code,
      retailerInfo: retailerInfo || '',
    });

    const createdCode = await uniqueCode.save();
    return NextResponse.json(createdCode, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
