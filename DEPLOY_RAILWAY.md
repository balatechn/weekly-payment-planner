# 🚀 Deploy to Railway - Recommended Method

Railway is the **best choice** for deploying this full-stack application because it supports all features:
- ✅ PostgreSQL database included
- ✅ Persistent file storage
- ✅ Cron jobs for scheduled emails
- ✅ No cold starts
- ✅ Long-running processes
- ✅ Free tier available

---

## Step 1: Install Railway CLI

```powershell
cd "d:\Weekly Planner"

# Install Railway CLI globally
npm install -g @railway/cli
```

---

## Step 2: Login to Railway

```powershell
# Login (will open browser)
railway login
```

Follow the browser authentication.

---

## Step 3: Initialize Project

```powershell
# Initialize Railway project
railway init

# Answer prompts:
# Project name: weekly-payment-planner
# Environment: production
```

---

## Step 4: Add PostgreSQL Database

```powershell
# Add PostgreSQL service
railway add postgresql
```

Railway automatically provisions a PostgreSQL database and sets DATABASE_URL.

---

## Step 5: Set Environment Variables

```powershell
# Set variables via CLI
railway variables set JWT_SECRET="your-secure-jwt-secret-here"
railway variables set EMAIL_HOST="smtp.office365.com"
railway variables set EMAIL_PORT="587"
railway variables set EMAIL_USER="finance@yourcompany.com"
railway variables set EMAIL_PASSWORD="your-email-app-password"
railway variables set EMAIL_FROM="finance@yourcompany.com"
railway variables set NODE_ENV="production"
```

**Generate JWT_SECRET:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

---

## Step 6: Deploy

```powershell
# Deploy to Railway
railway up
```

Railway will:
1. Upload your code
2. Install dependencies
3. Build the application
4. Start the server
5. Provide a public URL

---

## Step 7: Run Database Migrations

```powershell
# Link to Railway environment
railway link

# Run migrations on Railway database
railway run npm run migrate --prefix server

# Seed initial data
railway run npm run seed --prefix server
```

Or manually via Railway dashboard:
1. Open Railway dashboard
2. Go to your project
3. Click on PostgreSQL service
4. Open "Data" tab
5. Connect with provided credentials
6. Run SQL from migration files

---

## Step 8: Get Your Application URL

```powershell
# Open Railway dashboard
railway open
```

Your app will be available at: `https://your-app.railway.app`

Or set a custom domain in Railway dashboard → Settings → Domains

---

## Step 9: Update CLIENT_URL

```powershell
# Set CLIENT_URL to your Railway URL
railway variables set CLIENT_URL="https://your-app.railway.app"

# Redeploy
railway up
```

---

## Step 10: Test Your Application

1. Open `https://your-app.railway.app`
2. Login with default credentials:
   - Admin: admin@company.com / Admin@123
   - Finance: finance@company.com / Finance@123
   - User: user@company.com / User@123
3. Test all features:
   - ✅ Create payment requests
   - ✅ Upload attachments
   - ✅ Approve payments
   - ✅ Generate reports
   - ✅ Scheduled emails will run every Friday at 4 PM

---

## Railway CLI Commands

```powershell
# Deploy application
railway up

# View logs
railway logs

# Run command in Railway environment
railway run [command]

# List environment variables
railway variables

# Set environment variable
railway variables set KEY=value

# Delete environment variable
railway variables delete KEY

# Open Railway dashboard
railway open

# Link to existing project
railway link

# Show project status
railway status

# Connect to database
railway connect postgresql
```

---

## Configure Custom Domain (Optional)

1. Go to Railway dashboard
2. Select your project
3. Click on your service (web)
4. Go to **Settings** → **Domains**
5. Click **Generate Domain** or **Add Custom Domain**
6. For custom domain:
   - Add your domain (e.g., payments.yourcompany.com)
   - Update DNS records as shown
   - Railway provides SSL automatically

---

## Monitoring and Logs

### View Logs in Real-Time

```powershell
# Follow logs
railway logs --follow

# View recent logs
railway logs --limit 100
```

### View in Dashboard

1. Go to Railway dashboard
2. Click on your service
3. Go to **Deployments** tab
4. Click on latest deployment
5. View build and runtime logs

---

## Database Management

### Connect to PostgreSQL

```powershell
# Connect to database shell
railway connect postgresql
```

Or use GUI client:
1. Get connection details from Railway dashboard
2. Use with tools like:
   - pgAdmin
   - DBeaver
   - TablePlus
   - Postico (Mac)

### Backup Database

```powershell
# Get DATABASE_URL from Railway
railway variables

# Backup database
pg_dump [DATABASE_URL] > backup.sql

# Restore database
psql [DATABASE_URL] < backup.sql
```

---

## Scaling (If Needed)

Railway automatically scales based on traffic, but you can configure:

1. Go to Railway dashboard
2. Select your service
3. Go to **Settings**
4. Configure:
   - Memory limit
   - CPU allocation
   - Replicas (Pro plan)

---

## Cost

**Free Tier:**
- $5 of usage per month
- Enough for development and small production apps
- ~500 hours of runtime

**Pro Plan ($20/month):**
- $20 credit per month
- Additional usage charged per second
- Priority support
- More resources

**Typical costs for this app:**
- Development: Free tier sufficient
- Production (low traffic): $5-10/month
- Production (medium traffic): $10-20/month

---

## Environment Variables Reference

Required variables for Railway:

```env
# Database (automatically set by Railway)
DATABASE_URL=postgresql://...

# JWT Secret (required)
JWT_SECRET=your-32-char-secret

# Email Configuration (optional)
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=finance@yourcompany.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=finance@yourcompany.com

# Application URLs
CLIENT_URL=https://your-app.railway.app
NODE_ENV=production

# Optional: Microsoft 365 SSO
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-secret
AZURE_TENANT_ID=your-tenant-id
REDIRECT_URI=https://your-app.railway.app/auth/callback
```

---

## Troubleshooting

### Deployment Failed

```powershell
# Check logs
railway logs

# Redeploy
railway up
```

### Database Connection Error

```powershell
# Check DATABASE_URL is set
railway variables

# Test connection
railway run npm run migrate --prefix server
```

### Application Not Starting

```powershell
# Check build logs
railway logs

# Verify package.json scripts
railway run npm start --prefix server
```

---

## Update/Redeploy

```powershell
# Make your code changes
# Then redeploy
railway up

# Or enable automatic deployments from GitHub:
# 1. Connect GitHub repo in Railway dashboard
# 2. Enable auto-deploy on push to main branch
```

---

## Advantages of Railway vs Vercel

| Feature | Railway | Vercel |
|---------|---------|--------|
| PostgreSQL | ✅ Built-in | ❌ External only |
| File Storage | ✅ Persistent | ❌ Temporary |
| Cron Jobs | ✅ Native | ❌ Workarounds |
| Cold Starts | ✅ None | ❌ Frequent |
| Timeout | ✅ No limit | ❌ 10-60s |
| Full Node.js | ✅ Yes | ❌ Serverless only |
| **Best For** | **Full-stack apps** | **Static/JAMstack** |

---

## Production Checklist

- [ ] Deploy application to Railway
- [ ] Add PostgreSQL database
- [ ] Set all environment variables
- [ ] Run database migrations
- [ ] Seed initial data
- [ ] Test login and features
- [ ] Configure custom domain (optional)
- [ ] Setup database backups
- [ ] Test scheduled email (Friday 4 PM)
- [ ] Change default passwords
- [ ] Monitor logs for errors
- [ ] Setup alerts (Railway dashboard)

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

---

**Railway is recommended for production deployment of this application! 🚂**

All features work perfectly, and setup is simpler than traditional hosting.
