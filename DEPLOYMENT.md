# Deployment Guide - Weekly Payment Planner

## Prerequisites for Production

- [ ] Production PostgreSQL database
- [ ] Domain name (optional)
- [ ] SSL certificate (recommended)
- [ ] Email server credentials
- [ ] Azure AD app (for SSO, optional)

---

## Option 1: Deploy on Windows Server

### 1. Install Required Software

```powershell
# Install Node.js v18+
# Download from: https://nodejs.org/

# Install PostgreSQL v14+
# Download from: https://www.postgresql.org/download/windows/

# Install PM2 globally for process management
npm install -g pm2
```

### 2. Setup Production Database

```sql
CREATE DATABASE payment_planner_prod;
CREATE USER payment_app WITH PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE payment_planner_prod TO payment_app;
```

### 3. Clone and Configure

```powershell
# Clone or copy project to server
cd C:\inetpub\payment-planner

# Install dependencies
npm run install-all

# Build frontend
cd client
npm run build
cd ..

# Configure production environment
cd server
Copy-Item .env.example .env.production
```

Edit `server/.env.production`:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://payment_app:strong_password@localhost:5432/payment_planner_prod
JWT_SECRET=your-very-secure-random-string-here
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=finance@yourcompany.com
EMAIL_PASSWORD=your-app-password
CLIENT_URL=https://yourcompany.com
```

### 4. Initialize Database

```powershell
cd server
$env:NODE_ENV="production"
npm run migrate
npm run seed
```

### 5. Start with PM2

```powershell
# Start backend
pm2 start server/index.js --name payment-planner-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Check status
pm2 status
pm2 logs payment-planner-api
```

### 6. Configure IIS (for serving frontend)

1. Install IIS URL Rewrite Module
2. Create new website in IIS
3. Point to `client/dist` folder
4. Configure reverse proxy for `/api` to `http://localhost:5000`

**web.config** for client/dist:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="API Proxy" stopProcessing="true">
                    <match url="^api/(.*)$" />
                    <action type="Rewrite" url="http://localhost:5000/api/{R:1}" />
                </rule>
                <rule name="React Routes" stopProcessing="true">
                    <match url=".*" />
                    <conditions logicalGrouping="MatchAll">
                        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
                        <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
                    </conditions>
                    <action type="Rewrite" url="/" />
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
</configuration>
```

---

## Option 2: Deploy on Linux Server (Ubuntu)

### 1. Install Dependencies

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js v18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### 2. Setup PostgreSQL

```bash
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE payment_planner_prod;
CREATE USER payment_app WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE payment_planner_prod TO payment_app;
\q
```

### 3. Deploy Application

```bash
# Clone project
cd /var/www
git clone <your-repo> payment-planner
cd payment-planner

# Install dependencies
npm run install-all

# Build frontend
cd client
npm run build
cd ..

# Configure environment
cd server
cp .env.example .env.production
nano .env.production
```

### 4. Initialize Database

```bash
cd /var/www/payment-planner/server
NODE_ENV=production npm run migrate
NODE_ENV=production npm run seed
```

### 5. Start with PM2

```bash
cd /var/www/payment-planner
pm2 start server/index.js --name payment-planner-api -i max
pm2 startup
pm2 save
```

### 6. Configure Nginx

Create `/etc/nginx/sites-available/payment-planner`:

```nginx
server {
    listen 80;
    server_name yourcompany.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourcompany.com;

    ssl_certificate /etc/ssl/certs/yourcompany.crt;
    ssl_certificate_key /etc/ssl/private/yourcompany.key;

    # Frontend
    location / {
        root /var/www/payment-planner/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Uploads
    location /uploads {
        alias /var/www/payment-planner/server/uploads;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/payment-planner /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Option 3: Deploy on Docker

### 1. Create Dockerfile (Backend)

Create `server/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]
```

### 2. Create Dockerfile (Frontend)

Create `client/Dockerfile`:
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

### 3. Create docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: payment_planner
      POSTGRES_USER: payment_app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./server
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://payment_app:${DB_PASSWORD}@db:5432/payment_planner
      JWT_SECRET: ${JWT_SECRET}
      EMAIL_HOST: ${EMAIL_HOST}
      EMAIL_PORT: ${EMAIL_PORT}
      EMAIL_USER: ${EMAIL_USER}
      EMAIL_PASSWORD: ${EMAIL_PASSWORD}
    ports:
      - "5000:5000"
    depends_on:
      - db
    volumes:
      - ./server/uploads:/app/uploads

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 4. Deploy

```bash
# Create .env file
echo "DB_PASSWORD=strong_password" > .env
echo "JWT_SECRET=your-secret" >> .env

# Start containers
docker-compose up -d

# Initialize database (first time only)
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

---

## Post-Deployment Checklist

- [ ] Test login with all user roles
- [ ] Test payment creation and approval workflow
- [ ] Test email sending
- [ ] Test report generation
- [ ] Verify file uploads work
- [ ] Check automated email cron job
- [ ] Monitor error logs
- [ ] Setup database backups
- [ ] Configure SSL certificate
- [ ] Setup monitoring (optional: PM2 Plus, New Relic)
- [ ] Document production URLs and credentials

---

## Maintenance

### Database Backup

**Windows:**
```powershell
pg_dump -U payment_app payment_planner_prod > backup_$(Get-Date -Format "yyyyMMdd").sql
```

**Linux:**
```bash
pg_dump -U payment_app payment_planner_prod > backup_$(date +%Y%m%d).sql
```

### View Logs

**PM2:**
```bash
pm2 logs payment-planner-api
pm2 logs payment-planner-api --lines 100
```

**Docker:**
```bash
docker-compose logs -f backend
```

### Restart Application

**PM2:**
```bash
pm2 restart payment-planner-api
```

**Docker:**
```bash
docker-compose restart backend
```

---

## Security Recommendations

1. **Use strong passwords** for database and JWT secret
2. **Enable HTTPS** with valid SSL certificate
3. **Configure firewall** to allow only necessary ports
4. **Regular security updates** for OS and dependencies
5. **Database backups** scheduled daily
6. **Monitor logs** for suspicious activity
7. **Rate limiting** on API endpoints (optional)
8. **Environment variables** never committed to git
9. **Restrict database** access to localhost only
10. **Regular dependency updates** with `npm audit`

---

## Support

For deployment issues, check:
- Application logs: `pm2 logs` or `docker-compose logs`
- Database connectivity
- Environment variables configuration
- Firewall and port settings
- Nginx/IIS configuration

---

**Good luck with your deployment! 🚀**
