# PostgreSQL Migration Guide

Complete guide for converting your backend from SQLite to PostgreSQL.

## What Changed

### ✅ SQLite → PostgreSQL
- Replaced `sqlite3` package with `pg` package
- SQLite file database → PostgreSQL server database

### ✅ Callbacks → Async/Await
```javascript
// SQLite (Callbacks)
db.run("INSERT INTO contacts (...) VALUES (...)", [data], function(err) {
    if (err) res.status(500).json({ error: err.message });
    res.json({ data: { id: this.lastID } });
});

// PostgreSQL (Async/Await)
const result = await pool.query(
    "INSERT INTO contacts (...) VALUES (...)",
    [data]
);
res.json({ data: { id: result.rows[0].id } });
```

### ✅ Query Syntax
```javascript
// SQLite - Positional placeholders
db.run("INSERT INTO contacts (name, email) VALUES (?, ?)", [name, email]);

// PostgreSQL - Numbered placeholders
pool.query("INSERT INTO contacts (name, email) VALUES ($1, $2)", [name, email]);
```

### ✅ Connection Management
```javascript
// SQLite - Single database object
const db = new sqlite3.Database('./business.db');

// PostgreSQL - Connection pool
const { pool } = require('./database');
// Pool automatically manages connections
```

## File Changes

| File | Changes |
|------|---------|
| `package.json` | Removed `sqlite3`, added `pg` and `dotenv` |
| `server.js` | Complete rewrite with async routes and connection handling |
| `database.js` | NEW - Connection pool and initialization |
| `.env.example` | NEW - Environment variables template |
| `.env` | NEW (LOCAL ONLY) - Your local configuration |
| `init-db.js` | NEW - Optional database setup script |
| `README.md` | Updated with PostgreSQL instructions |

## Step-by-Step Setup

### 1. Install New Dependencies
```bash
cd backend
npm install
# This installs: pg, dotenv (and keeps existing: express, cors, helmet, etc.)
```

### 2. Create `.env` File
Copy `.env.example` to `.env` and fill in your database details:

```bash
# For Local Development
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=business_db
NODE_ENV=development
PORT=3000
```

### 3. Set Up PostgreSQL Database

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
createdb business_db
```

**Windows:**
- Install PostgreSQL (default: user `postgres`)
- Open pgAdmin or Command Prompt:
  ```
  createdb -U postgres business_db
  ```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
createdb business_db
```

### 4. Start the Server
```bash
npm start
```

Your server will:
1. Load environment variables from `.env`
2. Connect to PostgreSQL using connection pool
3. Automatically create tables if they don't exist
4. Display connection status

### 5. Test the Server
```bash
# Health check
curl http://localhost:3000/api/health

# Submit a contact
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Hello"}'

# Get all contacts (admin)
curl http://localhost:3000/api/contacts
```

## Data Migration (If You Have SQLite Data)

If you need to migrate existing data from SQLite:

### Option 1: Export/Import (Easiest)

```bash
# Export SQLite to CSV
echo ".mode csv" > commands.sql
echo ".headers on" >> commands.sql
echo ".output contacts.csv" >> commands.sql
echo "SELECT * FROM contacts;" >> commands.sql
sqlite3 business.db < commands.sql

# Then import into PostgreSQL
psql -U postgres -d business_db -c "\COPY contacts(name, email, message, timestamp) FROM 'contacts.csv' WITH (FORMAT csv, HEADER);"
```

### Option 2: Write a Migration Script
Create `migrate-data.js`:
```javascript
const sqlite3 = require('sqlite3');
const { pool } = require('./database');

const sqliteDb = new sqlite3.Database('./business.db');

// Migrate contacts
sqliteDb.all('SELECT * FROM contacts', [], async (err, rows) => {
    if (err) throw err;
    for (const row of rows) {
        await pool.query(
            'INSERT INTO contacts (name, email, message, timestamp) VALUES ($1, $2, $3, $4)',
            [row.name, row.email, row.message, row.timestamp]
        );
    }
    console.log('Migration complete');
});
```

## Environment Variables

### Local Development (`.env`)
```
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
DB_NAME=business_db
NODE_ENV=development
PORT=3000
```

### Render Deployment
Set these in Render Dashboard → Environment:
```
DB_USER=[from database URL]
DB_PASSWORD=[from database URL]
DB_HOST=[from database URL]
DB_PORT=5432
DB_NAME=[from database URL]
NODE_ENV=production
```

**Finding credentials in Render database URL:**
```
postgresql://username:password@host:5432/database_name
                ↑        ↑       ↑             ↑
            DB_USER DB_PASSWORD DB_HOST    DB_NAME
```

## Key Features Added

✅ **Connection Pooling** - Manages 20 concurrent connections  
✅ **Async/Await** - Modern, readable code  
✅ **Error Handling** - Try/catch blocks for all database operations  
✅ **Environment Variables** - Secure configuration  
✅ **SSL Support** - Automatic in production  
✅ **Graceful Shutdown** - Closes connections cleanly  
✅ **Health Check** - `/api/health` endpoint  
✅ **Database Auto-Init** - Tables created automatically  

## Troubleshooting

### `Error: connect ECONNREFUSED 127.0.0.1:5432`
PostgreSQL not running. Start it:
- macOS: `brew services start postgresql@15`
- Windows: Start PostgreSQL service in Services or pgAdmin
- Linux: `sudo systemctl start postgresql`

### `ERROR: database "business_db" does not exist`
Create the database:
```bash
createdb business_db
```

### `Error: password authentication failed`
Check `DB_USER` and `DB_PASSWORD` in `.env` match your PostgreSQL setup

### `Error: connect ENOTFOUND` (on Render)
Verify environment variables are set correctly in Render dashboard

### Connection Pool Errors
- Ensure max connections isn't too high
- Check for connection leaks (queries not completing)
- Monitor with: `SELECT count(*) FROM pg_stat_activity;`

## Performance Comparison

| Feature | SQLite | PostgreSQL |
|---------|--------|-----------|
| Concurrent Users | ~5 | 100+ |
| Data Size | <1GB | Unlimited |
| Connection Pooling | No | Yes ✅ |
| Production Ready | No | Yes ✅ |
| Deployment | Tricky | Easy ✅ |
| Scaling | Not possible | Horizontal ✅ |

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Set up PostgreSQL locally
3. ✅ Create `.env` file
4. ✅ Start server: `npm start`
5. ✅ Test endpoints with curl
6. ✅ Deploy to Render (see README.md)

## Testing Checklist

- [ ] Server starts without errors
- [ ] `GET /api/health` returns OK
- [ ] `POST /api/contact` creates new record
- [ ] `GET /api/contacts` returns all contacts
- [ ] `POST /api/reviews` creates new review
- [ ] `GET /api/reviews` returns 10 latest reviews
- [ ] Error handling works (bad email, missing fields)
- [ ] Rate limiting works (>50 requests in 15 min)

## Support

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- PG Package Docs: https://node-postgres.com/
- Render PostgreSQL: https://render.com/docs/postgresql
- Express Guide: https://expressjs.com/

---

**All your routes continue to work exactly the same!**  
The frontend doesn't need any changes.
