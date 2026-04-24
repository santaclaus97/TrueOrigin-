const express = require('express');
const router = express.Router();
const UniqueCode = require('../models/UniqueCode');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');
const crypto = require('crypto');

// Helper to generate a random code
const generateRandomCode = () => {
    return crypto.randomBytes(6).toString('hex').toUpperCase(); // 12 character hex string
};

// @route   POST /api/codes
// @desc    Generate a new unique code for a product
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const { productId, retailerInfo } = req.body;

        // Ensure product exists and belongs to the admin
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.manufacturer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized, you do not own this product' });
        }

        let isUnique = false;
        let code = '';

        // Ensure code uniqueness
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
        res.status(201).json(createdCode);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/codes/verify/:code
// @desc    Verify if a code is original and its status
// @access  Public
router.get('/verify/:code', async (req, res) => {
    try {
        const uniqueCode = await UniqueCode.findOne({ code: req.params.code })
            .populate({
                path: 'productId',
                populate: {
                    path: 'manufacturer',
                    select: 'name email'
                }
            });

        if (!uniqueCode) {
            return res.status(404).json({ message: 'Invalid code, product not found or counterfeit' });
        }

        res.json({
            code: uniqueCode.code,
            isLocked: uniqueCode.isLocked,
            retailerInfo: uniqueCode.retailerInfo,
            product: uniqueCode.productId,
            message: uniqueCode.isLocked ? 'This product has already been sold.' : 'This product is original and available.'
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// @route   GET /api/codes/admin
// @desc    Get all codes for products owned by the admin
// @access  Private/Admin
router.get('/admin', protect, admin, async (req, res) => {
    try {
        // Find all products owned by this admin
        const products = await Product.find({ manufacturer: req.user._id });
        const productIds = products.map(p => p._id);

        const codes = await UniqueCode.find({ productId: { $in: productIds } })
            .populate('productId', 'name')
            .populate('firstBuyer', 'name email');

        res.json(codes);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
