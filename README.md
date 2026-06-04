# Weekly Payment Planner 💼

<div align="center">

**A professional web-based payment management system for finance and administration teams**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

</div>

---

## 📋 Overview

The **Weekly Payment Planner** is a comprehensive web application designed to streamline payment request management, approval workflows, and automated email scheduling for finance teams. Built with modern technologies and best practices, it provides a robust solution for managing organizational payment processes.

### Key Capabilities

✅ **Payment Request Management** - Create, track, and manage payment requests  
✅ **Approval Workflow** - Multi-stage approval process with audit trail  
✅ **Automated Emails** - Weekly payment schedules sent automatically  
✅ **Comprehensive Reports** - Entity-wise, vendor-wise, and forecast reports  
✅ **Role-Based Access** - Admin, Finance, and Department User roles  
✅ **Dark/Light Mode** - Professional UI with theme switching  
✅ **Audit Logging** - Complete activity tracking  

---

## 🚀 Quick Start

Get started in 5 minutes! See [QUICKSTART.md](./QUICKSTART.md) for detailed instructions.

```powershell
# 1. Install dependencies
npm run install-all

# 2. Setup database
cd server
Copy-Item .env.example .env
# Edit .env with your database credentials
npm run migrate
npm run seed

# 3. Start application
cd ..
npm run dev
```

**Access:** http://localhost:5173  
**Login:** admin@company.com / Admin@123

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](./QUICKSTART.md) | Get up and running in 5 minutes |
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Comprehensive setup instructions |
| [API_DOCS.md](./API_DOCS.md) | Complete API reference |
| [FEATURES.md](./FEATURES.md) | Full feature list and checklist |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment guide |

---

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Node.js 18+ with Express.js 4.18
- PostgreSQL 14+ with Sequelize ORM
- JWT authentication with Passport.js
- Nodemailer for email automation
- Node-cron for scheduled tasks
- Multer for file uploads
- ExcelJS for report generation

**Frontend:**
- React 18.2 with Vite 5.0
- Tailwind CSS 3.4 for styling
- Zustand for state management
- React Router 6.21 for navigation
- Axios for HTTP requests
- Lucide React for icons

**Security:**
- JWT-based authentication
- Bcrypt password hashing
- Helmet for security headers
- CORS protection
- Role-based authorization
- SQL injection protection

### Project Structure

```
Weekly Planner/
├── server/                  # Backend API
│   ├── config/             # Database and passport config
│   ├── models/             # Sequelize models
│   ├── routes/             # API routes
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth, audit, error handling
│   ├── services/           # Email and cron services
│   ├── migrations/         # Database migrations
│   ├── seeders/            # Seed data
│   └── uploads/            # File uploads
│
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── stores/        # Zustand stores
│   │   └── App.jsx        # Main app component
│   └── public/            # Static assets
│
└── docs/                  # Documentation
```

---

## ✨ Features

### 🔐 Authentication & Security
- Email/password authentication
- Microsoft 365 SSO support
- JWT-based sessions
- Role-based access control
- Secure password hashing

### 💰 Payment Management
- Create payment requests with attachments
- Draft, submit, approve workflow
- Status tracking (Draft → Submitted → Approved → Paid)
- Multi-entity support
- Vendor management
- Payment terms configuration
- Automatic amount calculations

### ✅ Approval Workflow
- Finance team approval queue
- Approve/reject with comments
- Multi-stage approval support
- Approval history tracking
- Email notifications

### 📊 Dashboard & Analytics
- Real-time payment statistics
- Recent payments overview
- Entity-wise breakdown
- Overdue payment alerts
- Upcoming payment forecasts

### 📈 Reports & Exports
- **Entity-wise Payment Report**
- **Vendor-wise Payment Report**
- **Monthly Payment Forecast**
- Excel export with formatting
- Custom date range filtering

### 📧 Email Automation
- Automated weekly emails (Friday 4:00 PM)
- Professional HTML templates
- Configurable recipients
- Manual send option
- Email history tracking

### 📝 Audit & Compliance
- Complete audit trail
- User action logging
- Before/after value tracking
- IP and user agent recording
- Searchable audit logs

### 🎨 User Interface
- Modern, professional design
- Navy blue corporate theme
- Dark/light mode toggle
- Fully responsive layout
- Toast notifications
- Loading states
- Form validation

---

## 👥 User Roles

### Admin
- Full system access
- User management
- Entity management
- Email recipient configuration
- Audit log access
- All payment operations

### Finance Team
- View all payments
- Approve/reject payments
- Generate reports
- Send email schedules
- View email history

### Department User
- Create payment requests
- Edit own drafts
- View own payments
- Submit for approval
- Track approval status

---

## 🔧 Installation

### Prerequisites

- Node.js v18 or higher
- PostgreSQL v14 or higher
- npm or yarn

### Step-by-Step Setup

**See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.**

1. Clone the repository
2. Install dependencies: `npm run install-all`
3. Configure database in `server/.env`
4. Run migrations: `npm run migrate`
5. Seed data: `npm run seed`
6. Start application: `npm run dev`

---

## 🌐 Default Users

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | Admin@123 |
| Finance | finance@company.com | Finance@123 |
| Department User | user@company.com | User@123 |

**⚠️ Change these passwords in production!**

---

## 📦 NPM Scripts

### Root Directory

```powershell
npm run install-all    # Install all dependencies
npm run dev           # Start both frontend and backend
npm run dev:server    # Start backend only
npm run dev:client    # Start frontend only
```

### Server Directory

```powershell
npm run dev           # Start development server
npm start             # Start production server
npm run migrate       # Run database migrations
npm run seed          # Seed database
npm run migrate:undo  # Rollback last migration
```

### Client Directory

```powershell
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
```

---

## 📧 Email Configuration

Configure email settings in `server/.env`:

```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=finance@company.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=finance@company.com
EMAIL_CRON_SCHEDULE=0 16 * * 5  # Friday 4PM
```

**Supported Email Providers:**
- Microsoft 365 / Outlook
- Gmail (with app password)
- Any SMTP server

---

## 🔐 Environment Variables

Create `server/.env` with:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=payment_planner
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key

# Email
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@company.com
EMAIL_PASSWORD=your-password

# Optional: Microsoft 365 SSO
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-secret
AZURE_TENANT_ID=your-tenant-id
```

---

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions including:

- Windows Server deployment
- Linux (Ubuntu) deployment
- Docker deployment
- Nginx configuration
- PM2 process management
- SSL certificate setup
- Database backups

---

## 📊 API Endpoints

Complete API documentation available in [API_DOCS.md](./API_DOCS.md).

**Base URL:** `http://localhost:5000/api`

**Main Routes:**
- `/auth` - Authentication
- `/users` - User management
- `/entities` - Entity management
- `/payments` - Payment CRUD
- `/approvals` - Approval operations
- `/dashboard` - Dashboard data
- `/reports` - Report generation
- `/emails` - Email operations
- `/audit` - Audit logs

---

## 🧪 Testing

### Test Default Workflow

1. **Login as Department User** (user@company.com)
   - Create a payment request
   - Submit for approval

2. **Login as Finance** (finance@company.com)
   - View pending approvals
   - Approve the payment

3. **Login as Admin** (admin@company.com)
   - View all payments
   - Generate reports
   - Manage entities and users

---

## 🛠️ Development

### Running Development Server

```powershell
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Database Migrations

```powershell
# Create new migration
cd server
npx sequelize-cli migration:generate --name migration-name

# Run migrations
npm run migrate

# Rollback migration
npm run migrate:undo
```

---

## 📝 License

This is proprietary software developed for internal use.

---

## 🤝 Support

For issues, questions, or feature requests:

1. Check the documentation files
2. Review API documentation
3. Check server logs
4. Verify database connection
5. Ensure environment variables are configured

---

## 🎯 Roadmap

Current Version: **1.0.0** ✅

**Completed:**
- ✅ Core payment management
- ✅ Approval workflow
- ✅ Email automation
- ✅ Report generation
- ✅ Audit logging
- ✅ Dark mode
- ✅ Responsive design

**Future Enhancements:**
- [ ] Advanced analytics dashboard
- [ ] Mobile app
- [ ] SMS notifications
- [ ] Bulk Excel upload
- [ ] Integration with accounting software
- [ ] Vendor portal

---

## 💡 Tips & Best Practices

### For Administrators
- Regularly backup the database
- Monitor audit logs for security
- Keep default passwords changed
- Review email recipients list
- Check system logs weekly

### For Finance Team
- Review pending approvals daily
- Use reports for monthly reconciliation
- Verify email schedules are sent
- Check for overdue payments

### For Department Users
- Submit payments well before due date
- Attach all required documents
- Provide clear payment descriptions
- Track your submission status

---

## 🏆 Credits

**Developed with:**
- React for dynamic UI
- Node.js for robust backend
- PostgreSQL for reliable data storage
- Tailwind CSS for beautiful styling
- Express.js for RESTful API

---

<div align="center">

**Made with ❤️ for efficient payment management**

[Quick Start](./QUICKSTART.md) • [Setup Guide](./SETUP_GUIDE.md) • [API Docs](./API_DOCS.md)

</div>
   ```bash
   npm run install-all
   ```

3. **Configure environment variables**
   
   Create `server/.env` file:
   ```
   PORT=5000
   DATABASE_URL=postgresql://username:password@localhost:5432/payment_planner
   JWT_SECRET=your-secret-key
   
   # Microsoft 365 SSO
   AZURE_CLIENT_ID=your-client-id
   AZURE_CLIENT_SECRET=your-client-secret
   AZURE_TENANT_ID=your-tenant-id
   REDIRECT_URI=http://localhost:5000/auth/callback
   
   # Email Configuration
   EMAIL_HOST=smtp.office365.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@company.com
   EMAIL_PASSWORD=your-email-password
   EMAIL_FROM=finance@company.com
   
   # Frontend URL
   CLIENT_URL=http://localhost:5173
   ```

4. **Set up the database**
   ```bash
   cd server
   npm run migrate
   npm run seed
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Project Structure

```
weekly-payment-planner/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── context/       # React context
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx
│   └── package.json
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   └── index.js
└── package.json
```

## User Roles

### Admin
- Manage users and departments
- Configure email recipients
- Schedule automatic emails
- View all submissions

### Department User
- Create payment requests
- Edit own requests
- View payment history

### Finance Team
- View all payment requests
- Approve/reject requests
- Generate reports
- Send consolidated schedules

## Default Login Credentials

After running seed data:
- **Admin**: admin@company.com / Admin@123
- **Finance**: finance@company.com / Finance@123
- **Department User**: user@company.com / User@123

## API Documentation

See [API_DOCS.md](./API_DOCS.md) for detailed API documentation.

## License

ISC
