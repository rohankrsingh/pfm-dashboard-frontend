# PFM Dashboard Backend

Personal Financial Management Dashboard Backend API built with Node.js, Express, and MongoDB.

## Features

- **Authentication**: User signup/login with JWT tokens
- **Accounts**: Create and manage multiple financial accounts
- **Transactions**: Track income and expenses with categories
- **Budgets**: Set and monitor monthly budgets
- **Dashboard**: Get financial summary and analytics

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update:
```bash
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### 3. Get MongoDB Connection String
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Click "Connect" → "Drivers"
4. Copy connection string
5. Replace `username` and `password` in `.env`

### 4. Run Development Server
```bash
npm run dev
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Accounts
- `GET /api/accounts` - List all accounts
- `POST /api/accounts` - Create account
- `GET /api/accounts/:id` - Get account details
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

### Transactions
- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/account/:accountId` - Get account transactions
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/stats/:month` - Get monthly stats (format: YYYY-MM)

## Request Examples

### Sign Up
```json
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Account
```json
POST /api/accounts
Authorization: Bearer {token}
{
  "name": "Checking",
  "type": "checking",
  "balance": 1000,
  "color": "#3B82F6"
}
```

### Create Transaction
```json
POST /api/transactions
Authorization: Bearer {token}
{
  "description": "Grocery shopping",
  "amount": 50,
  "type": "expense",
  "category": "food",
  "accountId": "account_id"
}
```

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT
- **Validation**: express-validator
- **Password Hashing**: bcryptjs

## Development

- Use `npm run dev` for development with auto-reload (requires nodemon)
- Add environment variables to `.env` file
- Never commit `.env` file

