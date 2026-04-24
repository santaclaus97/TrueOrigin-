const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trueorigin';
const allowedOrigins = [
    process.env.FRONTEND_URL,
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/,
].filter(Boolean);

// Middleware
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.some((allowedOrigin) => (
            allowedOrigin instanceof RegExp
                ? allowedOrigin.test(origin)
                : allowedOrigin === origin
        ))) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked request from ${origin}`));
    },
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Backend running' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/codes', require('./routes/codes'));
app.use('/api/orders', require('./routes/orders'));

// Database Connection
mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log(`MongoDB connected: ${mongoUri}`))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
