const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const UniqueCode = require('../models/UniqueCode');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/orders
// @desc    Create a new order (purchase a product via its unique code)
// @access  Private (Buyer)
router.post('/', protect, async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'No code provided' });
        }

        // Find the unique code document
        const uniqueCodeDoc = await UniqueCode.findOne({ code });

        if (!uniqueCodeDoc) {
            return res.status(404).json({ message: 'Invalid code' });
        }

        // Logic: First purchase vs Resale
        let isResale = false;

        if (!uniqueCodeDoc.isLocked) {
            // First purchase: Lock the code and assign first buyer
            uniqueCodeDoc.firstBuyer = req.user._id;
            uniqueCodeDoc.isLocked = true;
            await uniqueCodeDoc.save();
        } else {
            // Already locked, so this is a resale/subsequent purchase.
            // Rule: Second or later buyers must NOT modify the unique code.
            isResale = true;
        }

        // Store in Orders DB (for both first and later purchases)
        const order = new Order({
            buyer: req.user._id,
            uniqueCode: uniqueCodeDoc._id,
            isResale,
        });

        const createdOrder = await order.save();

        // Populate for the response
        const populatedOrder = await Order.findById(createdOrder._id)
            .populate({
                path: 'uniqueCode',
                populate: { path: 'productId', select: 'name description' }
            });

        res.status(201).json(populatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/orders/myorders
// @desc    Get logged in user orders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user._id })
            .populate({
                path: 'uniqueCode',
                select: 'code retailerInfo isLocked',
                populate: { path: 'productId', populate: { path: 'manufacturer', select: 'name' } }
            })
            .sort({ purchaseDate: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
