const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    uniqueCode: {
        type: mongoose.Schema.Types.ObjectId,
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

module.exports = mongoose.model('Order', orderSchema);
