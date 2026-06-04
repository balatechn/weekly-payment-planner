# Vercel Deployment Guide

## ⚠️ Important Notes

Vercel is optimized for frontend and serverless functions. For this full-stack application with PostgreSQL and scheduled tasks, consider these limitations:

### Limitations on Vercel:
- ❌ **No persistent file storage** (uploads won't persist)
- ❌ **No cron jobs** (scheduled emails won't work natively)
- ❌ **Serverless function timeout** (10s on Hobby, 60s on Pro)
- ❌ **Cold starts** (first request may be slow)

### Recommended Alternative Deployment:
For full functionality, consider:
- **Railway.app** - Full Node.js support, PostgreSQL, persistent storage
- **Render.com** - Free tier with PostgreSQL, cron jobs
- **Heroku** - Traditional hosting with full features
- **DigitalOcean App Platform** - Full control

---

## Deploy to Vercel (Limited Functionality)

### Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** - Will be installed in steps below
3. **PostgreSQL Database** - Use external service:
   - [Supabase](https://supabase.com) (Free tier available)
   - [Neon](https://neon.tech) (Serverless PostgreSQL)
   - [Railway](https://railway.app) (PostgreSQL hosting)
   - [ElephantSQL](https://www.elephantsql.com) (Free tier)

---

## Step 1: Setup External PostgreSQL Database

### Option A: Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database to provision
4. Go to **Settings** → **Database**
5. Copy the **Connection String** (URI format)

### Option B: Neon

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

### Option C: Railway

1. Go to [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy the connection string from variables tab

**Save your DATABASE_URL** - you'll need it for Vercel environment variables.

---

## Step 2: Install Vercel CLI

```powershell
cd "d:\Weekly Planner"

# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
```

Follow the browser authentication flow.

---

## Step 3: Build Frontend

```powershell
cd client
npm run build
cd ..
```

---

## Step 4: Configure Environment Variables

Create a `.env.production` file with your production settings:

```env
# Database (from your chosen provider)
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT Secret (generate a strong random string)
JWT_SECRET=your-production-jwt-secret-minimum-32-characters

# Email Configuration
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=finance@yourcompany.com
EMAIL_PASSWORD=your-email-app-password
EMAIL_FROM=finance@yourcompany.com

# Vercel URLs (will be set after first deploy)
CLIENT_URL=https://your-app.vercel.app
```

---

## Step 5: Set Vercel Environment Variables

You can set environment variables via CLI or Vercel Dashboard.

### Option A: Via Vercel CLI (during deployment)

```powershell
# Vercel will prompt you for environment variables during first deploy
vercel
```

### Option B: Via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `EMAIL_HOST`
   - `EMAIL_PORT`
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
   - `EMAIL_FROM`
   - `NODE_ENV` = `production`

---

## Step 6: Deploy to Vercel

### First Deployment

```powershell
cd "d:\Weekly Planner"

# Deploy (will prompt for configuration)
vercel
```

**Answer the prompts:**
```
? Set up and deploy "~/Weekly Planner"? [Y/n] Y
? Which scope do you want to deploy to? [Your account]
? Link to existing project? [N/y] N
? What's your project's name? weekly-payment-planner
? In which directory is your code located? ./
```

Vercel will:
1. Upload your code
2. Build the frontend
3. Deploy serverless functions
4. Give you a preview URL

### Production Deployment

```powershell
# Deploy to production
vercel --prod
```

---

## Step 7: Run Database Migrations

After deployment, you need to run migrations on your production database.

### Option A: Run Locally Against Production DB

```powershell
cd server

# Set production DATABASE_URL temporarily
$env:DATABASE_URL="your-production-database-url"

# Run migrations
npx sequelize-cli db:migrate

# Seed initial data
npx sequelize-cli db:seed:all
```

### Option B: Use Database Provider's SQL Editor

Run the SQL from your migration files directly in:
- Supabase SQL Editor
- Neon SQL Console
- Railway Database tab

---

## Step 8: Test Your Deployment

1. **Visit your Vercel URL**: `https://your-app.vercel.app`
2. **Login** with default credentials:
   - Email: `admin@company.com`
   - Password: `Admin@123`
3. **Test features**:
   - Create a payment request
   - Approve payments
   - Generate reports

---

## Known Limitations on Vercel

### 1. File Uploads Won't Persist

**Problem:** Uploaded files are stored in serverless filesystem and will be lost.

**Solutions:**
- Use **AWS S3** for file storage
- Use **Cloudinary** for file uploads
- Use **Vercel Blob Storage** (paid feature)

### 2. Scheduled Emails Won't Work

**Problem:** Vercel doesn't support cron jobs natively.

**Solutions:**
- Use **Vercel Cron Jobs** (Beta feature)
- Use **External Cron Service**:
  - [cron-job.org](https://cron-job.org)
  - [EasyCron](https://www.easycron.com)
  - Hit your API endpoint weekly: `GET /api/emails/send-weekly`
- Use **GitHub Actions** with scheduled workflows

### 3. Cold Starts

**Problem:** First request after inactivity may be slow.

**Solution:**
- Upgrade to Vercel Pro (better cold start performance)
- Keep functions warm with scheduled pings
- Accept the limitation for low-traffic apps

---

## Alternative: Deploy to Railway (Full Features)

Railway supports full Node.js applications with PostgreSQL and cron jobs.

### Quick Railway Deployment

```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add postgresql

# Deploy
railway up
```

Railway automatically:
- ✅ Hosts your Express server
- ✅ Provides PostgreSQL database
- ✅ Supports cron jobs
- ✅ Persistent file storage
- ✅ Environment variables

**Railway is recommended for this application!**

---

## Useful Vercel Commands

```powershell
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs [deployment-url]

# List deployments
vercel ls

# Remove project
vercel remove [project-name]

# Open project in browser
vercel open

# Environment variables
vercel env add [name]
vercel env ls
vercel env rm [name]
```

---

## Troubleshooting

### Database Connection Errors

**Check:**
- DATABASE_URL is correct in Vercel environment variables
- PostgreSQL allows connections from Vercel IPs (0.0.0.0/0 for Supabase/Neon)
- Connection string includes `?sslmode=require` if needed

### Build Fails

**Solutions:**
```powershell
# Test build locally
cd client
npm run build

# Check for errors
vercel logs
```

### API Routes Not Working

**Check:**
- Routes in `vercel.json` are correct
- Backend code is in `server/` directory
- `server/api/index.js` exports the Express app

---

## Recommendation

**For production use with all features (uploads, cron jobs, full functionality):**

### Deploy to Railway Instead:

```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway add postgresql
railway up
```

**Railway gives you:**
- ✅ Full Express.js support
- ✅ Persistent file storage
- ✅ Cron jobs for scheduled emails
- ✅ Built-in PostgreSQL
- ✅ Faster response times
- ✅ Better for this application

**Or use Render.com:**
- Free tier available
- PostgreSQL included
- Cron jobs supported
- Easy deployment

---

## Next Steps

1. ✅ Choose deployment platform (Vercel limited, Railway recommended)
2. ✅ Setup external database
3. ✅ Configure environment variables
4. ✅ Deploy application
5. ✅ Run migrations
6. ✅ Test thoroughly
7. ✅ Setup scheduled emails (if using Railway/Render)
8. ✅ Configure file storage (S3/Cloudinary if using Vercel)

---

**For questions or issues, refer to:**
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
