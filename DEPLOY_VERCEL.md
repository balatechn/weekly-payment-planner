# 🚀 Deploy to Vercel - Quick Guide

## ⚠️ Important: Read This First!

### Vercel Limitations for This Application

**This application has features that DON'T work well on Vercel:**
- ❌ **File uploads won't persist** (serverless = no permanent storage)
- ❌ **Scheduled emails (cron jobs) won't work** natively
- ❌ **Cold starts** may cause slow first requests
- ❌ **10-second function timeout** on free tier

### ✅ Recommended: Use Railway or Render Instead

**Railway.app** (Recommended for this app):
- ✅ Full Node.js support
- ✅ Built-in PostgreSQL
- ✅ Persistent file storage
- ✅ Cron jobs work
- ✅ No cold starts
- ✅ Free tier available

**Quick Railway Deploy:**
```powershell
npm install -g @railway/cli
railway login
railway init
railway add postgresql
railway up
```

---

## If You Still Want to Deploy to Vercel

Follow these steps:

### Step 1: Setup PostgreSQL Database

You MUST use an external PostgreSQL provider. Choose one:

#### Option A: Supabase (Recommended)
1. Go to https://supabase.com
2. Create account and new project
3. Wait for database provisioning
4. Go to **Settings** → **Database** → **Connection String**
5. Copy the URI (should look like: `postgresql://postgres:password@host:5432/postgres`)

#### Option B: Neon
1. Go to https://neon.tech
2. Create account and project
3. Copy connection string

#### Option C: Railway (Just for Database)
1. Go to https://railway.app
2. Create new project
3. Add PostgreSQL service
4. Copy DATABASE_URL from variables

**Save your DATABASE_URL!** You'll need it next.

---

### Step 2: Login to Vercel

```powershell
cd "d:\Weekly Planner"

# Login to Vercel (will open browser)
vercel login
```

Follow the browser authentication.

---

### Step 3: Deploy to Vercel

```powershell
# Deploy (first time)
vercel
```

**Answer the prompts:**
```
? Set up and deploy "~/Weekly Planner"? Y
? Which scope? [Your account]
? Link to existing project? N
? What's your project's name? weekly-payment-planner
? In which directory is your code located? ./
```

Vercel will now ask for environment variables. You'll need:

1. **DATABASE_URL**: Paste your PostgreSQL connection string
2. **JWT_SECRET**: Generate a secure random string (minimum 32 characters)
3. **EMAIL_HOST**: smtp.office365.com (or your email provider)
4. **EMAIL_PORT**: 587
5. **EMAIL_USER**: your-email@company.com
6. **EMAIL_PASSWORD**: your-email-app-password
7. **EMAIL_FROM**: finance@company.com
8. **NODE_ENV**: production

**Generate JWT_SECRET:**
```powershell
# Run this to generate a random 32-character string
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

After deployment, Vercel will give you a URL like:
```
https://weekly-payment-planner-xyz123.vercel.app
```

---

### Step 4: Add CLIENT_URL Environment Variable

```powershell
# Add CLIENT_URL with your actual Vercel URL
vercel env add CLIENT_URL

# When prompted, enter your Vercel URL:
# https://weekly-payment-planner-xyz123.vercel.app
```

---

### Step 5: Deploy to Production

```powershell
# Deploy to production
vercel --prod
```

---

### Step 6: Initialize Database

Your database needs tables. Run migrations:

```powershell
cd server

# Set DATABASE_URL to your production database
$env:DATABASE_URL="your-production-database-url"

# Run migrations
npx sequelize-cli db:migrate

# Seed initial data (creates default users and entities)
npx sequelize-cli db:seed:all
```

**Default users will be created:**
- Admin: admin@company.com / Admin@123
- Finance: finance@company.com / Finance@123
- User: user@company.com / User@123

---

### Step 7: Test Your Deployment

1. Open your Vercel URL in browser
2. Login with: admin@company.com / Admin@123
3. Test features:
   - ✅ Login/logout
   - ✅ Dashboard
   - ✅ Create payment request
   - ❌ File upload (won't work on Vercel)
   - ❌ Scheduled emails (won't work on Vercel)

---

## Working Around Vercel Limitations

### Fix 1: File Uploads (Use Cloudinary)

Since Vercel doesn't support persistent file storage, use Cloudinary:

```powershell
cd server
npm install cloudinary multer-storage-cloudinary
```

Sign up at https://cloudinary.com and get your credentials.

### Fix 2: Scheduled Emails (Use External Cron)

Use a service to trigger your email endpoint weekly:

**Option A: cron-job.org**
1. Go to https://cron-job.org
2. Create account
3. Add new cron job:
   - URL: `https://your-app.vercel.app/api/emails/send-weekly`
   - Schedule: Every Friday at 4:00 PM
   - Method: POST

**Option B: GitHub Actions**
Create `.github/workflows/weekly-email.yml` in your repo.

---

## Vercel CLI Commands Reference

```powershell
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Add environment variable
vercel env add VARIABLE_NAME

# List environment variables
vercel env ls

# Remove environment variable
vercel env rm VARIABLE_NAME

# Pull environment variables to local
vercel env pull

# Open project in browser
vercel open

# Remove project
vercel remove [project-name]
```

---

## Troubleshooting

### "Database connection failed"
- Check DATABASE_URL is correct in Vercel environment variables
- Ensure database allows connections from 0.0.0.0/0
- Add `?sslmode=require` to connection string if using SSL

### "Build failed"
```powershell
# Test build locally first
cd client
npm run build
```

### "API routes returning 404"
- Check vercel.json is in root directory
- Verify routes configuration
- Redeploy with `vercel --prod`

### "Function timeout"
- Upgrade to Vercel Pro (60s timeout instead of 10s)
- Or use Railway/Render for better performance

---

## Alternative: Deploy to Railway (Recommended)

Railway is better suited for this application:

```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd "d:\Weekly Planner"
railway init

# Add PostgreSQL
railway add postgresql

# Deploy
railway up
```

Railway will:
- ✅ Host your Express server
- ✅ Provide PostgreSQL database
- ✅ Support file uploads
- ✅ Run cron jobs
- ✅ No cold starts
- ✅ Automatic HTTPS

**Railway is strongly recommended for production use!**

---

## Summary

**Vercel Deployment:**
✅ Good for: Simple frontend + API  
❌ Bad for: File uploads, cron jobs, long-running tasks

**Railway/Render Deployment:**
✅ Good for: Full-stack apps, databases, cron jobs, file storage  
✅ Better for: This application

**Choose Railway or Render for production deployment with full features!**

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Supabase Docs: https://supabase.com/docs

See [VERCEL_ENV_VARS.md](./VERCEL_ENV_VARS.md) for complete environment variable guide.
