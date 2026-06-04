# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All API requests (except login and register) require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@company.com",
  "name": "John Doe",
  "password": "password123",
  "role": "department_user",
  "department": "Operations"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@company.com",
    "name": "John Doe",
    "role": "department_user",
    "department": "Operations"
  }
}
```

### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "admin@company.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### GET /api/auth/me
Get current user information.

**Response:**
```json
{
  "id": "uuid",
  "email": "admin@company.com",
  "name": "Admin User",
  "role": "admin"
}
```

---

## Payment Endpoints

### POST /api/payments
Create a new payment request.

**Request:** `multipart/form-data`

**Fields:**
- entityId (required)
- vendorName (required)
- natureOfExpense (required)
- invoiceNumber (required)
- invoiceDate (required)
- invoiceAmount (required)
- gstAmount (optional)
- dueDate (required)
- paymentTerms (required)
- remarks (optional)
- attachment (file, optional)

### GET /api/payments
Get all payments with filters.

**Query Parameters:**
- entityId
- status
- vendorName
- weekNumber
- weekYear
- page (default: 1)
- limit (default: 50)

### GET /api/payments/:id
Get single payment details.

### PUT /api/payments/:id
Update payment.

### DELETE /api/payments/:id
Delete payment (only drafts).

### POST /api/payments/:id/submit
Submit payment for approval.

---

## Entity Endpoints

### GET /api/entities
Get all entities.

### POST /api/entities (Admin only)
Create new entity.

### PUT /api/entities/:id (Admin only)
Update entity.

### DELETE /api/entities/:id (Admin only)
Delete entity.

---

## Approval Endpoints

### GET /api/approvals/pending (Finance/Admin only)
Get pending approvals.

### POST /api/approvals/:id/approve (Finance/Admin only)
Approve payment.

**Request Body:**
```json
{
  "comments": "Approved"
}
```

### POST /api/approvals/:id/reject (Finance/Admin only)
Reject payment.

**Request Body:**
```json
{
  "rejectionReason": "Insufficient documentation",
  "comments": "Please provide additional invoices"
}
```

---

## Dashboard Endpoints

### GET /api/dashboard/summary
Get dashboard summary statistics.

### GET /api/dashboard/recent-payments
Get recent payments.

### GET /api/dashboard/entity-stats
Get entity-wise statistics.

---

## Report Endpoints

### GET /api/reports/entity-wise
Download entity-wise report (Excel).

**Query Parameters:**
- startDate (optional)
- endDate (optional)

### GET /api/reports/vendor-wise
Download vendor-wise report (Excel).

### GET /api/reports/monthly-forecast
Download monthly forecast (Excel).

**Query Parameters:**
- month (required)
- year (required)

---

## Email Endpoints

### GET /api/emails/history
Get email history.

### POST /api/emails/send-weekly (Finance/Admin only)
Manually trigger weekly email.

### GET /api/emails/recipients (Admin only)
Get email recipients.

### POST /api/emails/recipients (Admin only)
Add email recipient.

---

## User Endpoints

### GET /api/users (Admin/Finance only)
Get all users.

### POST /api/users (Admin only)
Create user.

### PUT /api/users/:id (Admin only)
Update user.

### DELETE /api/users/:id (Admin only)
Delete user.

---

## Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
