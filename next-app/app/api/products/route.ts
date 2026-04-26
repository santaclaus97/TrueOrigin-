import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import UniqueCode from '@/models/UniqueCode';
import { protect, admin } from '@/lib/middleware';

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({}).populate('manufacturer', 'name email').lean();
    
    // Enrich products with available code count
    const enrichedProducts = await Promise.all(products.map(async (p: any) => {
      const availableCount = await UniqueCode.countDocuments({ 
        productId: p._id, 
        isLocked: false 
      });
      return { ...p, availableCount };
    }));

    return NextResponse.json(enrichedProducts);
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

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
    const { name, description, price, quantity, image } = await req.json();

    const product = new Product({
      name,
      description,
      price: price || 0,
      quantity: quantity || 1,
      image: image || '',
      manufacturer: authResult.user._id,
    });

    const createdProduct = await product.save();

    const qty = parseInt(quantity) || 1;
    const codeDocs = [];
    for (let i = 1; i <= qty; i++) {
      const uniqueCode = new UniqueCode({
        productId: createdProduct._id,
        code: `${createdProduct._id.toString().slice(-4).toUpperCase()}${String(i).padStart(6, '0')}`,
      });
      codeDocs.push(uniqueCode);
    }

    await UniqueCode.insertMany(codeDocs);

    return NextResponse.json({ ...createdProduct.toObject(), codesGenerated: qty }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
