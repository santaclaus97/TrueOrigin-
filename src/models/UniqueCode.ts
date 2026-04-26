import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUniqueCode extends Document {
  productId: mongoose.Types.ObjectId;
  code: string;
  retailerInfo: string;
  firstBuyer: mongoose.Types.ObjectId | null;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const uniqueCodeSchema = new Schema<IUniqueCode>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  retailerInfo: {
    type: String,
    default: '',
  },
  firstBuyer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const UniqueCode: Model<IUniqueCode> = mongoose.models.UniqueCode || mongoose.model<IUniqueCode>('UniqueCode', uniqueCodeSchema);

export default UniqueCode;
