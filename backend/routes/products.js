const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const UniqueCode = require('../models/UniqueCode');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({}).populate('manufacturer', 'name email');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('manufacturer', 'name email');
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/products
// @desc    Create a product and auto-generate sequential unique codes
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, description, price, quantity, image } = req.body;

        const product = new Product({
            name,
            description,
            price: price || 0,
            quantity: quantity || 1,
            image: image || '',
            manufacturer: req.user._id,
        });

        const createdProduct = await product.save();

        // Auto-generate sequential unique codes: 0000000001, 0000000002, ...
        const qty = parseInt(quantity) || 1;
        const codeDocs = [];
        for (let i = 1; i <= qty; i++) {
            const code = String(i).padStart(10, '0');
            // Make code unique per product by prefixing with product short id
            const uniqueCode = new UniqueCode({
                productId: createdProduct._id,
                code: `${createdProduct._id.toString().slice(-4).toUpperCase()}${String(i).padStart(6, '0')}`,
            });
            codeDocs.push(uniqueCode);
        }

        await UniqueCode.insertMany(codeDocs);

        res.status(201).json({ ...createdProduct.toObject(), codesGenerated: qty });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
