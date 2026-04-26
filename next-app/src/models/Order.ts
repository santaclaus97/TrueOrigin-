import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrder extends Document {
  buyer: mongoose.Types.ObjectId;
  uniqueCode: mongoose.Types.ObjectId;
  purchaseDate: Date;
  isResale: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uniqueCode: {
    type: Schema.Types.ObjectId,
    ref: 'UniqueCode',
    required: true,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  isResale: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);

export default Order;
