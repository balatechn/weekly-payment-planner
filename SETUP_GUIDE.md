# Setup Guide - Weekly Payment Planner

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** (optional) - [Download](https://git-scm.com/)

---

## Installation Steps

### 1. Navigate to Project Directory

```powershell
cd "d:\Weekly Planner"
```

### 2. Install All Dependencies

```powershell
npm run install-all
```

This will install dependencies for:
- Root project
- Backend (server)
- Frontend (client)

---

## Database Setup

### 1. Create PostgreSQL Database

Open PostgreSQL command line or pgAdmin and create a new database:

```sql
CREATE DATABASE payment_planner;
```

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory:

```powershell
cd server
Copy-Item .env.example .env
```

Edit `server/.env` with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=payment_planner
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Secret (change this to a random string)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Email Configuration (Optional for now)
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@company.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=finance@company.com
```

### 3. Run Database Migrations

```powershell
# From server directory
npm run migrate
```

### 4. Seed Initial Data

```powershell
# From server directory
npm run seed
```

This will create:
- Default admin user: `admin@company.com` / `Admin@123`
- Default finance user: `finance@company.com` / `Finance@123`
- Default department user: `user@company.com` / `User@123`
- Sample entities (National Group, Rainland Auto Corp, etc.)
- Default email recipients

---

## Running the Application

### Option 1: Run Both Backend and Frontend Together (Recommended)

From the root directory:

```powershell
cd "d:\Weekly Planner"
npm run dev
```

This will start:
- **Backend API** on http://localhost:5000
- **Frontend** on http://localhost:5173

### Option 2: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```powershell
cd "d:\Weekly Planner\server"
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd "d:\Weekly Planner\client"
npm run dev
```

---

## Accessing the Application

1. Open your browser and navigate to: **http://localhost:5173**

2. Login with default credentials:
   - **Admin:** admin@company.com / Admin@123
   - **Finance:** finance@company.com / Finance@123
   - **User:** user@company.com / User@123

---

## Email Configuration (Optional)

To enable automated weekly emails:

### For Microsoft 365 / Outlook:

1. Update `server/.env`:
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@company.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=finance@company.com
```

2. **Important:** Use an App Password instead of your regular password:
   - Go to Microsoft Account Security
   - Enable 2-factor authentication
   - Generate an App Password
   - Use this password in the EMAIL_PASSWORD field

### For Gmail:

1. Update `server/.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

2. **Important:** Enable "Less secure app access" or use App Password:
   - Go to Google Account Settings
   - Enable 2-Step Verification
   - Generate an App Password
   - Use this password in the EMAIL_PASSWORD field

### Testing Email Configuration

After configuring, restart the server:
```powershell
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

Look for this message in the console:
```
✅ Email server is ready
```

---

## Automated Weekly Email Schedule

By default, the system sends weekly payment schedule emails every **Friday at 4:00 PM**.

To change the schedule, edit `server/.env`:

```env
# Cron format: minute hour day-of-month month day-of-week
# Default: 0 16 * * 5 (Friday 4:00 PM)
EMAIL_CRON_SCHEDULE=0 16 * * 5
```

**Examples:**
- Every Monday at 9:00 AM: `0 9 * * 1`
- Every day at 3:00 PM: `0 15 * * *`
- Every Friday at 5:30 PM: `30 17 * * 5`

---

## Microsoft 365 SSO Setup (Optional)

### 1. Register Application in Azure AD

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Enter application name: "Weekly Payment Planner"
5. Set redirect URI: `http://localhost:5000/auth/callback`
6. Click **Register**

### 2. Configure Application

1. Copy the **Application (client) ID**
2. Copy the **Directory (tenant) ID**
3. Go to **Certificates & secrets**
4. Create a new **Client secret**
5. Copy the secret value

### 3. Update Environment Variables

Edit `server/.env`:

```env
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_TENANT_ID=your-tenant-id
REDIRECT_URI=http://localhost:5000/auth/callback
```

### 4. Restart Server

```powershell
# Stop and restart the server
npm run dev
```

---

## Troubleshooting

### Database Connection Error

**Error:** `Unable to connect to the database`

**Solution:**
1. Ensure PostgreSQL is running
2. Check database credentials in `server/.env`
3. Verify database exists: `payment_planner`
4. Test connection with pgAdmin or psql

### Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
1. Change the port in `server/.env`:
   ```env
   PORT=5001
   ```
2. Update proxy in `client/vite.config.js` to match

### Module Not Found

**Error:** `Cannot find module 'xyz'`

**Solution:**
```powershell
# Reinstall dependencies
cd server
Remove-Item -Recurse -Force node_modules
npm install

cd ../client
Remove-Item -Recurse -Force node_modules
npm install
```

### Email Not Sending

**Solutions:**
1. Check email credentials in `server/.env`
2. Use App Password instead of regular password
3. Check console for email configuration errors
4. Verify SMTP server settings
5. Check firewall/antivirus isn't blocking SMTP port 587

---

## Building for Production

### 1. Build Frontend

```powershell
cd "d:\Weekly Planner\client"
npm run build
```

### 2. Configure Production Environment

Create `server/.env.production`:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=your-production-database-url
JWT_SECRET=your-very-secure-production-secret
# ... other production settings
```

### 3. Start Production Server

```powershell
cd "d:\Weekly Planner\server"
set NODE_ENV=production
npm start
```

---

## Default User Roles

### Admin
- Manage users and entities
- Configure email recipients
- View all payments and reports
- Approve/reject payments
- Access audit logs

### Finance
- View all payments
- Approve/reject payments
- Generate reports
- Send email schedules
- View email history

### Department User
- Create payment requests
- Edit own draft payments
- View own payment history
- Submit payments for approval

---

## Support & Documentation

- **API Documentation:** See [API_DOCS.md](./API_DOCS.md)
- **Project README:** See [README.md](./README.md)

---

## Next Steps

1. ✅ Login to the application
2. ✅ Create entities (if not using default ones)
3. ✅ Add users for your team
4. ✅ Configure email recipients
5. ✅ Create your first payment request
6. ✅ Test the approval workflow
7. ✅ Generate reports
8. ✅ Configure automated emails

**Congratulations! Your Weekly Payment Planner is ready to use! 🎉**
