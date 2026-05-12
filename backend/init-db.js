/**
 * Database initialization script
 * Run this to manually set up tables if needed
 * Usage: node init-db.js
 */

require('dotenv').config();
const { pool, initializeDatabase } = require('./database');

async function main() {
    try {
        console.log('╔═══════════════════════════════════════╗');
        console.log('║  Database Initialization Script       ║');
        console.log('╚═══════════════════════════════════════╝\n');

        // Test connection
        console.log('Testing database connection...');
        const testResult = await pool.query('SELECT NOW()');
        console.log(`✓ Connected at: ${testResult.rows[0].now}\n`);

        // Initialize tables
        console.log('Creating tables...');
        await initializeDatabase();

        // Verify tables
        console.log('\nVerifying tables...');
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);

        console.log('\nTables created:');
        tablesResult.rows.forEach(row => {
            console.log(`  ✓ ${row.table_name}`);
        });

        // Check indexes
        const indexesResult = await pool.query(`
            SELECT indexname 
            FROM pg_indexes 
            WHERE schemaname = 'public'
            ORDER BY indexname;
        `);

        console.log('\nIndexes created:');
        indexesResult.rows.forEach(row => {
            console.log(`  ✓ ${row.indexname}`);
        });

        console.log('\n✓ Database initialization complete!\n');
        process.exit(0);
    } catch (err) {
        console.error('✗ Error:', err.message);
        process.exit(1);
    }
}

main();
