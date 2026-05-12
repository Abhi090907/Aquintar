/**
 * Secure Backend for Aquintar - PostgreSQL Edition
 * Uses async/await, connection pooling, and environment variables
 * Production-ready for Render deployment
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { pool, initializeDatabase, testConnection, closePool } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10kb' }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: "Too many requests, please try again later." }
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize database on startup
let dbReady = false;

async function startServer() {
    try {
        // Test connection
        const connected = await testConnection();
        if (!connected) {
            throw new Error('Failed to connect to database');
        }

        // Initialize database tables
        await initializeDatabase();
        dbReady = true;
        console.log('✓ Database ready');
    } catch (err) {
        console.error('✗ Failed to initialize database:', err.message);
        process.exit(1);
    }
}

// --- ROUTES ---

// 1. Submit Contact Form (User fills this)
app.post('/api/contact', [
    body('name').trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('message').trim().escape()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, message } = req.body;

        const result = await pool.query(
            `INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3) RETURNING id`,
            [name, email, message]
        );

        const id = result.rows[0].id;
        console.log(`✓ New inquiry from: ${name} (ID: ${id})`);
        res.json({ message: "Success", data: { id, name } });
    } catch (err) {
        console.error('Error inserting contact:', err.message);
        res.status(500).json({ error: 'Failed to submit contact form' });
    }
});

// 2. View Inquiries (Admin Dashboard uses this)
app.get('/api/contacts', async (req, res) => {
    try {
        // In a real app, add authentication/password check here!
        const result = await pool.query(
            `SELECT id, name, email, message, timestamp FROM contacts ORDER BY timestamp DESC`
        );

        res.json({ data: result.rows });
    } catch (err) {
        console.error('Error retrieving contacts:', err.message);
        res.status(500).json({ error: 'Failed to retrieve contacts' });
    }
});

// 3. Get Reviews
app.get('/api/reviews', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, role, rating, comment, timestamp FROM reviews ORDER BY timestamp DESC LIMIT 10`
        );

        res.json({ data: result.rows });
    } catch (err) {
        console.error('Error retrieving reviews:', err.message);
        res.status(500).json({ error: 'Failed to retrieve reviews' });
    }
});

// 4. Submit Review
app.post('/api/reviews', [
    body('name').trim().isLength({ min: 2 }).escape(),
    body('role').trim().escape(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').trim().isLength({ min: 5, max: 200 }).escape()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, role, rating, comment } = req.body;

        const result = await pool.query(
            `INSERT INTO reviews (name, role, rating, comment) VALUES ($1, $2, $3, $4) RETURNING id`,
            [name, role, rating, comment]
        );

        const id = result.rows[0].id;
        console.log(`✓ New review from: ${name} (ID: ${id})`);
        res.json({ message: "Review added", data: { id } });
    } catch (err) {
        console.error('Error inserting review:', err.message);
        res.status(500).json({ error: 'Failed to add review' });
    }
});

// --- SERVER STARTUP ---

// Start server with database initialization
const server = app.listen(PORT, async () => {
    console.log(`\n╔═══════════════════════════════════════╗`);
    console.log(`║  Backend Server Starting...           ║`);
    console.log(`╠═══════════════════════════════════════╣`);
    console.log(`║  Environment: ${process.env.NODE_ENV || 'development'.padEnd(24)}║`);
    console.log(`║  Port: ${PORT.toString().padEnd(32)}║`);
    console.log(`╚═══════════════════════════════════════╝\n`);

    await startServer();

    console.log(`\n✓ Server running at http://localhost:${PORT}`);
    console.log(`✓ Health check: http://localhost:${PORT}/api/health\n`);
});

// Graceful shutdown
async function gracefulShutdown(signal) {
    console.log(`\n\n⚠ ${signal} received - shutting down gracefully...`);

    server.close(async () => {
        console.log('✓ Server closed');
        await closePool();
        console.log('✓ Database connections closed');
        process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('✗ Forced shutdown due to timeout');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
    console.error('✗ Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('✗ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});