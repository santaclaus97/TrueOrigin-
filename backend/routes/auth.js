const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};

const ensureDatabaseConnected = (res) => {
    if (mongoose.connection.readyState !== 1) {
        res.status(503).json({
            message: 'Database unavailable. Start MongoDB locally or set MONGODB_URI in backend/.env.',
        });
        return false;
    }

    return true;
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        if (!ensureDatabaseConnected(res)) {
            return;
        }

        const { name, email, password, role } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        console.log('Registering user:', email);
        console.log("user", { name, email, role, password });
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'buyer'
        });
        console.log('User registered:', user.email);
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', async (req, res) => {
    try {
        if (!ensureDatabaseConnected(res)) {
            return;
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// @route   POST /api/auth/google
// @desc    Auth user using Google
// @access  Public
router.post('/google', async (req, res) => {
    try {
        if (!ensureDatabaseConnected(res)) {
            return;
        }

        const { credential } = req.body;
        
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'
        });
        
        const payload = ticket.getPayload();
        const { email, name } = payload;

        let user = await User.findOne({ email });

        if (user) {
            if (user.role === 'admin') {
                return res.status(403).json({ message: 'Admin login requires password' });
            }
        } else {
            const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
            user = await User.create({
                name,
                email,
                password: randomPassword,
                role: 'buyer'
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(401).json({ message: error.message || 'Google Auth failed' });
    }
});

module.exports = router;
