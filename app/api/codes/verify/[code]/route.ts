import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UniqueCode from '@/models/UniqueCode';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    await dbConnect();
    const { code } = await params;
    const uniqueCode = await UniqueCode.findOne({ code })
      .populate('firstBuyer', 'name email')
      .populate({
        path: 'productId',
        populate: {
          path: 'manufacturer',
          select: 'name email'
        }
      });

    if (!uniqueCode) {
      return NextResponse.json({ message: 'Invalid code, product not found or counterfeit' }, { status: 404 });
    }

    return NextResponse.json({
      code: uniqueCode.code,
      isLocked: uniqueCode.isLocked,
      retailerInfo: uniqueCode.retailerInfo,
      product: uniqueCode.productId,
      firstBuyer: uniqueCode.firstBuyer,
      message: uniqueCode.isLocked ? 'This product has already been sold.' : 'This product is original and available.'
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
