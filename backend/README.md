# Business Backend - PostgreSQL Edition

Secure, production-ready Node.js Express backend with PostgreSQL, async/await, connection pooling, and Render deployment support.

## Features

✅ **PostgreSQL Database** - Replaced SQLite with PostgreSQL for production workloads  
✅ **Async/Await** - All database operations use modern async/await syntax  
✅ **Connection Pooling** - Built-in connection pool management (20 max connections)  
✅ **Environment Variables** - Secure configuration with dotenv  
✅ **Error Handling** - Comprehensive error handling and logging  
✅ **Security** - Helmet, CORS, rate limiting, SQL injection prevention  
✅ **Production Ready** - Graceful shutdown, health checks, Render deployment ready  

## Local Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory (copy from `.env.example`):

```bash
# Local PostgreSQL setup
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=business_db

NODE_ENV=development
PORT=3000
```

### 3. Set Up PostgreSQL Locally

**On macOS (with Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
createdb business_db
```

**On Windows:**
- Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
- Run the installer (default user: `postgres`)
- Create database: `createdb business_db` in pgAdmin or psql

**On Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb business_db
```

### 4. Start the Server

```bash
npm start
```

You should see:
```
╔═══════════════════════════════════════╗
║  Backend Server Starting...           ║
╠═══════════════════════════════════════╣
║  Environment: development              ║
║  Port: 3000                            ║
╚═══════════════════════════════════════╝

✓ Database connection successful
✓ Database tables initialized successfully
✓ Server running at http://localhost:3000
✓ Health check: http://localhost:3000/api/health
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Submit Contact (User Form)
```
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Your message here"
}

Response: { "message": "Success", "data": { "id": 1, "name": "John Doe" } }
```

### Get All Contacts (Admin)
```
GET /api/contacts

Response: { "data": [{ "id": 1, "name": "...", "email": "...", "message": "...", "timestamp": "..." }] }
```

### Submit Review
```
POST /api/reviews
Content-Type: application/json

{
  "name": "Jane Smith",
  "role": "Customer",
  "rating": 5,
  "comment": "Great service and quality!"
}

Response: { "message": "Review added", "data": { "id": 1 } }
```

### Get Reviews
```
GET /api/reviews

Response: { "data": [{ "id": 1, "name": "...", "role": "...", "rating": 5, "comment": "...", "timestamp": "..." }] }
```

## Deployment on Render

### 1. Create a PostgreSQL Database on Render

- Log in to [Render](https://render.com)
- Click "New" → "PostgreSQL"
- Name: `business-db`
- Plan: Free tier (for testing)
- Copy the **External Database URL**

### 2. Create a Web Service on Render

- Click "New" → "Web Service"
- Connect your GitHub repository
- **Settings:**
  - Name: `business-backend`
  - Environment: `Node`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Plan: Free tier (or paid)

### 3. Add Environment Variables

In Render Web Service → Environment:

```
DB_USER=username_from_db_url
DB_PASSWORD=password_from_db_url
DB_HOST=host_from_db_url
DB_PORT=5432
DB_NAME=business_db
NODE_ENV=production
```

**To extract credentials from the External Database URL:**
```
postgresql://username:password@host:5432/database
```

### 4. Deploy

- Render will automatically deploy when you push to your GitHub branch
- Check deployment logs in Render dashboard
- Test with: `https://your-service.onrender.com/api/health`

## Database Schema

### Contacts Table
```sql
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contacts_email ON contacts(email);
```

### Reviews Table
```sql
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_timestamp ON reviews(timestamp DESC);
```

## File Structure

```
backend/
├── server.js              # Main Express application
├── database.js            # PostgreSQL pool & initialization
├── package.json           # Dependencies
├── .env.example           # Environment template
├── .env                   # Local environment (not in git)
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## Connection Pool Settings

The connection pool is configured for production:

```javascript
{
  max: 20,                    // Max 20 concurrent connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000,  // 2s timeout to acquire connection
}
```

## Error Handling

The application handles:
- Database connection errors
- Query execution errors
- Validation errors
- Graceful shutdown on SIGTERM/SIGINT
- Uncaught exceptions and unhandled rejections

All errors are logged to console with timestamps.

## Security Features

✅ **Helmet** - HTTP header security  
✅ **CORS** - Cross-Origin Resource Sharing  
✅ **Rate Limiting** - 50 requests per 15 minutes per IP  
✅ **Input Validation** - express-validator for all inputs  
✅ **SQL Injection Prevention** - Parameterized queries ($1, $2, etc.)  
✅ **Environment Variables** - Sensitive data never in code  

## Monitoring

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Logs
- Server logs appear in console during development
- Render logs available in deployment dashboard
- Check `/tmp` for any crash dumps

## Troubleshooting

### Connection refused
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Ensure PostgreSQL is running: `brew services start postgresql@15` (macOS)
- Check credentials in `.env`

### Database does not exist
```
ERROR: database "business_db" does not exist
```
- Create database: `createdb business_db`
- Or use Render's auto-provisioning

### Pool exhaustion (production)
- Increase `max` in `database.js`
- Check for connection leaks in application code
- Monitor active connections: `SELECT count(*) FROM pg_stat_activity;`

### Render deployment stuck
- Check build logs in Render dashboard
- Ensure Node version is compatible
- Check environment variables are set

## Performance Optimization

1. **Indexes** - Already created on `email` and `timestamp`
2. **Connection Pooling** - Automatically managed
3. **SSL** - Enabled in production (Render databases)
4. **Query Optimization** - Use `LIMIT`, `ORDER BY` wisely

## Next Steps

1. Add authentication for `/api/contacts` endpoint
2. Add request ID logging for tracing
3. Add database backup strategy (Render handles this)
4. Consider caching reviews with Redis
5. Add email notifications for new contacts
6. Implement pagination for large datasets

## Support

For issues:
- Check error logs in console
- Verify `.env` file configuration
- Ensure PostgreSQL is running (local) or Render database is accessible
- Test with `curl` before testing from frontend

---

**Last Updated**: May 2026  
**PostgreSQL Version**: 12+ required  
**Node Version**: 14+ required
