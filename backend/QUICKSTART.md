# Quick Start Guide - PostgreSQL Backend

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Set Up PostgreSQL Locally

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
createdb business_db
```

**Windows:**
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer (remember the password you set for `postgres` user)
3. Open PostgreSQL command line or pgAdmin
4. Run: `createdb business_db`

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb business_db
```

### Step 3: Create `.env` File
A template `.env` file already exists. Edit it with your PostgreSQL password:

```bash
# .env (already created)
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=business_db
NODE_ENV=development
PORT=3000
```

### Step 4: Start the Server
```bash
npm start
```

### Step 5: Test It Works
```bash
# Health check
curl http://localhost:3000/api/health

# Submit a contact
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is working!"
  }'
```

## 📝 What's New

| Before (SQLite) | After (PostgreSQL) |
|------|-----------|
| `sqlite3` | `pg` ✅ |
| Callbacks | Async/Await ✅ |
| File-based DB | Server-based DB ✅ |
| Can't scale | Highly scalable ✅ |
| Deploy tricky | Deploy to Render easily ✅ |

## 📁 Key Files

- `server.js` - Main application (async/await routes)
- `database.js` - Connection pool & initialization
- `.env` - Your local config (DON'T commit!)
- `.env.example` - Template for environment variables
- `README.md` - Full documentation
- `MIGRATION_GUIDE.md` - Detailed conversion info

## 🌐 Deploy to Render (Free)

1. Push your code to GitHub
2. Go to [render.com](https://render.com)
3. Create PostgreSQL database
4. Create Web Service pointing to your repo
5. Add environment variables from `.env`
6. Deploy!

[See README.md for detailed Render instructions](./README.md#deployment-on-render)

## ✅ Your API Endpoints Still Work!

All your existing routes work exactly the same:

```
POST   /api/contact          ✅ Submit contact
GET    /api/contacts         ✅ Get all contacts
POST   /api/reviews          ✅ Submit review
GET    /api/reviews          ✅ Get reviews
GET    /api/health           ✅ NEW - Health check
```

**No frontend changes needed!**

## 🐛 Troubleshooting

**Can't connect to database?**
```
psql: error: could not connect to server: No such file or directory
```
→ Make sure PostgreSQL is running: `brew services start postgresql@15`

**Database doesn't exist?**
```
ERROR: database "business_db" does not exist
```
→ Create it: `createdb business_db`

**Wrong password?**
```
ERROR: password authentication failed
```
→ Check `DB_PASSWORD` in `.env`

## 📚 Learn More

- [Full README](./README.md) - Complete documentation
- [Migration Guide](./MIGRATION_GUIDE.md) - What changed and why
- [PostgreSQL Docs](https://www.postgresql.org/docs/) - Database help
- [PG Package](https://node-postgres.com/) - Driver documentation

## 💡 Pro Tips

1. **Don't commit `.env`** - It's in `.gitignore` already
2. **Use connection pooling** - It's already configured for you
3. **Test before deploying** - Use curl or Postman locally first
4. **Monitor errors** - Check console output for detailed logs
5. **Keep secrets safe** - Never push API keys or passwords

---

**Ready to deploy?** See Render deployment section in [README.md](./README.md#deployment-on-render)

**Need help?** Check the [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed troubleshooting.
