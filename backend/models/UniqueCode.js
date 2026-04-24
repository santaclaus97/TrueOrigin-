const mongoose = require('mongoose');

const uniqueCodeSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Null means available for purchase
  },
  isLocked: {
    type: Boolean,
    default: false, // Becomes true after first buyer claims it
  },
}, { timestamps: true });

module.exports = mongoose.model('UniqueCode', uniqueCodeSchema);
