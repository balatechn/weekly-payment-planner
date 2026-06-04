# Quick Start Guide

Get your Weekly Payment Planner up and running in 5 minutes!

## Step 1: Install Dependencies

```powershell
cd "d:\Weekly Planner"
npm run install-all
```

⏱️ **Time:** ~2-3 minutes

---

## Step 2: Setup Database

### Create Database
```powershell
# Open PostgreSQL and run:
CREATE DATABASE payment_planner;
```

### Configure Environment
```powershell
cd server
Copy-Item .env.example .env
# Edit .env and update DB_PASSWORD with your PostgreSQL password
```

### Initialize Database
```powershell
npm run migrate
npm run seed
```

⏱️ **Time:** ~1 minute

---

## Step 3: Start the Application

```powershell
cd "d:\Weekly Planner"
npm run dev
```

⏱️ **Time:** ~30 seconds

---

## Step 4: Access the Application

🌐 **Open:** http://localhost:5173

🔐 **Login:**
- **Email:** admin@company.com
- **Password:** Admin@123

---

## That's It! 🎉

You're now ready to:
- ✅ Create payment requests
- ✅ Approve payments
- ✅ Generate reports
- ✅ Send weekly email schedules

---

## Default Users

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@company.com | Admin@123 |
| **Finance** | finance@company.com | Finance@123 |
| **Department User** | user@company.com | User@123 |

---

## Need Help?

📖 **Full Documentation:** See [SETUP_GUIDE.md](./SETUP_GUIDE.md)  
📡 **API Reference:** See [API_DOCS.md](./API_DOCS.md)  
📋 **Project Overview:** See [README.md](./README.md)

---

## Common Issues

### Database Connection Failed
✅ Make sure PostgreSQL is running  
✅ Check password in `server/.env`

### Port Already in Use
✅ Close other applications using port 5000 or 5173  
✅ Or change PORT in `server/.env`

### Module Not Found
✅ Run `npm run install-all` again

---

**Happy Planning! 💼**
