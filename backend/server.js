const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trueorigin';
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');
const hasFrontendBuild = fs.existsSync(frontendIndexPath);
const configuredOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URLS,
    process.env.RENDER_EXTERNAL_URL,
].flatMap((value) => (
    value
        ? value.split(',').map((origin) => origin.trim()).filter(Boolean)
        : []
));
const allowedOrigins = [
    ...configuredOrigins.map((origin) => origin.replace(/\/+$/, '')),
    /^http:\/\/localhost(?::\d+)?$/,
    /^http:\/\/127\.0\.0\.1(?::\d+)?$/,
];

// Middleware
app.use(cors({
    origin(origin, callback) {
        const normalizedOrigin = origin?.replace(/\/+$/, '');

        if (!normalizedOrigin || allowedOrigins.some((allowedOrigin) => (
            allowedOrigin instanceof RegExp
                ? allowedOrigin.test(normalizedOrigin)
                : allowedOrigin === normalizedOrigin
        ))) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked request from ${normalizedOrigin}`));
    },
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ message: 'Backend running' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/codes', require('./routes/codes'));
app.use('/api/orders', require('./routes/orders'));

if (hasFrontendBuild) {
    app.use(express.static(frontendDistPath));

    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/')) {
            return next();
        }

        return res.sendFile(frontendIndexPath);
    });
} else {
    app.get('/', (req, res) => {
        res.json({ message: 'Backend running' });
    });
}

// Database Connection
mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log(`MongoDB connected: ${mongoUri}`))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
