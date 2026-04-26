import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import UniqueCode from '@/models/UniqueCode';
import { protect, admin } from '@/lib/middleware';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const product = await Product.findById(id).populate('manufacturer', 'name email');
    
    if (product) {
      return NextResponse.json(product);
    } else {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await protect(req);
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    if (!admin(authResult.user)) {
      return NextResponse.json({ message: 'Not authorized as an admin' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    if (product.manufacturer.toString() !== authResult.user._id.toString()) {
      return NextResponse.json({ message: 'Not authorized to delete this product' }, { status: 401 });
    }

    // Delete all associated codes
    await UniqueCode.deleteMany({ productId: id });
    
    // Delete the product
    await Product.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Product and associated codes deleted' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
