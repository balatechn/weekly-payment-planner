# Environment Variables for Vercel

Before deploying to Vercel, you need to set these environment variables in your Vercel project settings.

## Required Environment Variables

### Database Configuration
```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

**How to get:**
1. Sign up for a PostgreSQL provider:
   - **Supabase** (Recommended): https://supabase.com
   - **Neon**: https://neon.tech
   - **Railway**: https://railway.app
   - **ElephantSQL**: https://www.elephantsql.com

2. Create a new PostgreSQL database
3. Copy the connection string (usually in format: `postgresql://user:pass@host:port/db`)

### JWT Secret
```
JWT_SECRET=your-super-secret-key-minimum-32-characters-long-change-this
```

**Generate a secure key:**
```powershell
# Generate random string in PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Email Configuration (Optional)
```
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=finance@yourcompany.com
EMAIL_PASSWORD=your-email-app-password
EMAIL_FROM=finance@yourcompany.com
```

**For Microsoft 365:**
- Use your Microsoft 365 email
- Generate an App Password (not your regular password)
- Go to: https://account.microsoft.com/security

**For Gmail:**
- Enable 2-factor authentication
- Generate App Password
- Go to: https://myaccount.google.com/security

### Node Environment
```
NODE_ENV=production
VERCEL=1
```

### Client URL (Set after first deploy)
```
CLIENT_URL=https://your-app.vercel.app
```

---

## How to Set Environment Variables in Vercel

### Method 1: Via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project (after first deploy)
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Key:** Variable name (e.g., `DATABASE_URL`)
   - **Value:** Variable value
   - **Environment:** Select all (Production, Preview, Development)
5. Click **Save**

### Method 2: Via Vercel CLI

```powershell
cd "d:\Weekly Planner"

# Add environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add EMAIL_HOST
vercel env add EMAIL_PORT
vercel env add EMAIL_USER
vercel env add EMAIL_PASSWORD
vercel env add EMAIL_FROM
vercel env add NODE_ENV
vercel env add CLIENT_URL

# List all environment variables
vercel env ls
```

### Method 3: Import from .env file

```powershell
# Pull existing environment variables
vercel env pull

# This creates a .env.local file with your Vercel environment variables
```

---

## Complete Environment Variables List

Copy this template and fill in your values:

```env
# Database (Required)
DATABASE_URL=postgresql://user:password@host:port/database

# JWT (Required)
JWT_SECRET=your-32-character-minimum-secret-key

# Email (Optional - required for email features)
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=finance@yourcompany.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=finance@yourcompany.com

# Application (Required)
NODE_ENV=production
VERCEL=1
CLIENT_URL=https://your-app.vercel.app

# Azure AD (Optional - for Microsoft 365 SSO)
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_TENANT_ID=your-azure-tenant-id
REDIRECT_URI=https://your-app.vercel.app/auth/callback
```

---

## After Deployment

### 1. Update CLIENT_URL

After your first deployment, Vercel will give you a URL like: `https://weekly-payment-planner.vercel.app`

Update the `CLIENT_URL` environment variable:
```powershell
vercel env add CLIENT_URL
# Enter: https://your-actual-app-url.vercel.app
```

### 2. Run Database Migrations

Your production database needs to be initialized:

```powershell
cd server

# Set your production DATABASE_URL temporarily
$env:DATABASE_URL="your-production-database-url"

# Run migrations
npx sequelize-cli db:migrate

# Seed initial data (optional)
npx sequelize-cli db:seed:all
```

Or run directly in your database provider's SQL console.

---

## Testing Environment Variables

After setting variables and deploying:

```powershell
# Check environment variables are set
vercel env ls

# Test your deployment
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-06-03T..."
}
```

---

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` files to git
- Use strong, unique passwords
- Rotate JWT_SECRET periodically
- Use App Passwords for email (not regular passwords)
- Keep DATABASE_URL secret
- Don't share environment variables publicly

---

## Quick Setup Checklist

- [ ] Create PostgreSQL database (Supabase/Neon/Railway)
- [ ] Copy DATABASE_URL
- [ ] Generate strong JWT_SECRET
- [ ] Configure email credentials (if using email features)
- [ ] Add all variables to Vercel Dashboard or CLI
- [ ] Deploy to Vercel
- [ ] Update CLIENT_URL with actual Vercel URL
- [ ] Run database migrations
- [ ] Test the application
