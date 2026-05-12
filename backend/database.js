/**
 * PostgreSQL Connection Pool with async/await support
 * Provides database connection management for Render deployment
 */

const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool using DATABASE_URL and SSL for Render / Supabase-compatible deployments
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
    // Connection pool settings
    max: 20, // Maximum connections in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Handle pool errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

/**
 * Initialize database tables
 * This creates the schema if it doesn't exist
 */
async function initializeDatabase() {
    try {
        const client = await pool.connect();

        try {
            // Create contacts table
            await client.query(`
                CREATE TABLE IF NOT EXISTS contacts (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create index on email for faster lookups
            await client.query(`
                CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email)
            `);

            // Create reviews table
            await client.query(`
                CREATE TABLE IF NOT EXISTS reviews (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    role VARCHAR(255) NOT NULL,
                    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                    comment TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create index on timestamp for faster sorting
            await client.query(`
                CREATE INDEX IF NOT EXISTS idx_reviews_timestamp ON reviews(timestamp DESC)
            `);

            console.log('Database tables initialized successfully');
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error initializing database:', err.message);
        throw err;
    }
}

/**
 * Test database connection
 */
async function testConnection() {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('Database connection successful:', result.rows[0]);
        return true;
    } catch (err) {
        console.error('Database connection failed:', err.message);
        return false;
    }
}

/**
 * Gracefully close the pool
 */
async function closePool() {
    try {
        await pool.end();
        console.log('Connection pool closed');
    } catch (err) {
        console.error('Error closing connection pool:', err.message);
    }
}

module.exports = {
    pool,
    initializeDatabase,
    testConnection,
    closePool
};
