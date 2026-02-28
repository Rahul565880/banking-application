# Banking Application

A full-stack banking application with React frontend, Node.js/Express backend, and MySQL database.

## Project Structure

```
banking-application/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Database connection and schema
│   │   ├── controllers/
│   │   │   ├── authController.js  # Authentication logic
│   │   │   └── bankController.js  # Banking operations
│   │   ├── middleware/
│   │   │   └── authMiddleware.js   # JWT authentication
│   │   ├── routes/
│   │   │   ├── authRoutes.js      # Auth API routes
│   │   │   └── bankRoutes.js      # Banking API routes
│   │   ├── utils/
│   │   │   └── jwtUtils.js        # JWT utilities
│   │   └── server.js              # Express server
│   ├── .env                       # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Register.jsx       # Registration page
│   │   │   ├── Login.jsx          # Login page
│   │   │   └── Dashboard.jsx      # Main dashboard
│   │   ├── services/
│   │   │   └── api.js            # Axios API service
│   │   ├── App.jsx               # Main app component
│   │   └── index.css             # Global styles
│   └── package.json
└── README.md
```

## Technology Stack

- **Frontend**: React (Vite), Axios, React Router
- **Backend**: Node.js, Express.js
- **Database**: MySQL (Aiven)
- **Authentication**: JWT (HttpOnly cookies), bcrypt

## Request Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React)                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐               │
│  │   Register  │    │    Login    │    │  Dashboard  │               │
│  │    Page     │    │    Page     │    │    Page     │               │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘               │
│         │                  │                  │                        │
│         └──────────────────┼──────────────────┘                        │
│                            │                                            │
│                   axios.withCredentials                                 │
└────────────────────────────┼────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        BACKEND (Express)                                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        API Routes                                 │  │
│  │  POST /api/auth/register   POST /api/auth/login                  │  │
│  │  POST /api/auth/logout     GET  /api/auth/check-auth             │  │
│  │  GET  /api/bank/balance    POST /api/bank/deposit                │  │
│  │  POST /api/bank/withdraw    GET  /api/bank/transactions           │  │
│  └────────────────────────────────┬─────────────────────────────────┘  │
│                                   │                                      │
│  ┌────────────────────────────────┼─────────────────────────────────┐  │
│  │         Middleware             │  JWT Validation                  │  │
│  │  - authenticateToken         │  - Verify HttpOnly cookie        │  │
│  │  - Cookie parsing             │  - Extract user ID                └────────────────────────────────┼ │  │
│─────────────────────────────────┘  │
│                                   │                                      │
│  ┌────────────────────────────────┼─────────────────────────────────┐  │
│  │       Controllers              │  - bcrypt password hashing      │  │
│  │  - authController              │  - Generate JWT tokens           │  │
│  │  - bankController             │  - Business logic                │  │
│  └────────────────────────────────┴─────────────────────────────────┘  │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATABASE (Aiven MySQL)                            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐               │
│  │    users    │    │   accounts  │    │ transactions│               │
│  │             │    │             │    │             │               │
│  │ id          │    │ id          │    │ id          │               │
│  │ username    │    │ user_id FK  │    │ user_id FK  │               │
│  │ email       │    │ balance     │    │ type        │               │
│  │ phone       │    │ created_at  │    │ amount      │               │
│  │ password    │    └─────────────┘    │ balance_after              │
│  │ created_at  │                         │ created_at                │
│  └─────────────┘                         └─────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MySQL database (Aiven)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h

DB_HOST=your-aiven-host
DB_PORT=12988
DB_USER=avnadmin
DB_PASSWORD=your-password
DB_NAME=banking_app

FRONTEND_URL=http://localhost:5173
```

4. Start the server:
```bash
npm start
```

The server will:
- Connect to Aiven MySQL
- Create the database and tables automatically
- Start listening on port 5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login user | No |
| POST | /api/auth/logout | Logout user | Yes |
| GET | /api/auth/check-auth | Check authentication | Yes |

### Banking
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/bank/balance | Get account balance | Yes |
| POST | /api/bank/deposit | Deposit money | Yes |
| POST | /api/bank/withdraw | Withdraw money | Yes |
| GET | /api/bank/transactions | Get transaction history | Yes |

## Security Features

- **Password Hashing**: bcrypt with salt
- **JWT Storage**: HttpOnly cookies only
- **Cookie Flags**: httpOnly, secure (production), sameSite
- **SQL Injection Protection**: Parameterized queries
- **Input Validation**: Server-side validation
- **Protected Routes**: Middleware authentication

## Usage

1. **Register**: Create an account at `/register`
2. **Login**: Login with credentials at `/login`
3. **Dashboard**: View balance, deposit, withdraw
4. **Transactions**: View transaction history

## License

MIT
