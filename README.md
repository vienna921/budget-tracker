# Budget Tracker

A full-stack personal finance application for tracking income, expenses, budgets, and monthly spending. Built as a hands-on full-stack project with authentication, persistent cloud data, receipt OCR, and a responsive React interface.

## Features
1. User authentication
    - User signup and login
    - Password hashing with bcrypt
    - Session-based authentication
    - Protected user data
2. Transaction management
    - Add income and expenses
    - Edit transactions
    - Delete transactions
    - Transaction categories and descriptions
    - Transaction dates
3. Financial dashboard
    - Total income
    - Total expenses
    - Current balance
    - Spending by category
    - Monthly summaries
    - Spending breakdown chart
4. Monthly filtering
    - Filter transactions by month
    - View monthly income, expenses, and balance
    - View monthly spending by category
5. Budget management
    - Create monthly category budgets
    - Edit budgets
    - Delete budgets
    - Track budgets separately for each user
6. Receipt scanning
    - Upload or take a photo of a receipt
    - OCR extracts receipt information
    - Review and edit extracted information
    - Save the result as an expense
7. Cloud deployment
    - React frontend deployed with Vercel
    - Express API deployed with Render
    - PostgreSQL database hosted with Neon
    - Python OCR service deployed with Render
## Tech Stack
### Frontend
    React
    Vite
    React Router
    Recharts
    CSS
### Backend
    Node.js
    Express
    PostgreSQL
    pg
    Express Session
    connect-pg-simple
    bcrypt
    CORS
    Multer
    Axios
### OCR
    Python
    Flask
    OpenCV
    Tesseract OCR
    Docker
### Database
    PostgreSQL
    Neon
### Deployment
    Vercel
    Render
    Neon
## Architecture
                    ┌─────────────────────┐
                    │      Vercel         │
                    │   React + Vite      │
                    └──────────┬──────────┘
                               │
                               │ HTTPS
                               ▼
                    ┌─────────────────────┐
                    │      Render         │
                    │ Express REST API    │
                    └───────┬─────┬───────┘
                            │     │
                 PostgreSQL │     │ OCR
                            │     │
                            ▼     ▼
                    ┌──────────┐ ┌──────────────┐
                    │  Neon    │ │    Render    │
                    │PostgreSQL│ │ Python OCR   │
                    └──────────┘ │ Tesseract    │
                                 └──────────────┘
## How It Works
### Authentication

Users create an account with a username and password. Passwords are hashed using bcrypt before being stored in PostgreSQL.

After login, Express creates a server-side session. Session information is stored in PostgreSQL so authenticated sessions can persist across server restarts.

Protected API routes use the authenticated user's session to ensure transactions and budgets belong to the correct user.

### Transactions

Transactions are stored in PostgreSQL and associated with the authenticated user.

Each transaction contains:

type
amount
category
description
date
user_id

The frontend communicates with the Express API using HTTP requests such as:

GET
POST
PATCH
DELETE

### Budgets

Budgets are associated with both a user and a month/category combination.

This allows different users to maintain separate budgets while preventing duplicate budgets for the same category in the same month.

Receipt OCR

Receipt scanning follows this flow:

Receipt image
     ↓
React frontend
     ↓
Express API
     ↓
Python OCR service
     ↓
OpenCV + Tesseract
     ↓
Extracted receipt data
     ↓
Review/edit form
     ↓
PostgreSQL transaction

The extracted information is shown to the user before being saved, allowing the user to correct OCR mistakes.

## Running Locally
1. Clone the repository
    git clone https://github.com/vienna921/budget-tracker.git
    cd budget-tracker

2. Install frontend dependencies
    npm install

3. Install backend dependencies
    cd server
    npm install
    cd ..

4. Create environment variables

    Create a .env file in the project root:

    VITE_API_URL=http://localhost:3000

    Create a .env file inside the server directory:

    DATABASE_URL=your_postgresql_connection_string
    SESSION_SECRET=your_session_secret
    FRONTEND_URL=http://localhost:5173
    NODE_ENV=development
    OCR_URL=http://localhost:5001

    Never commit .env files or secret values to GitHub.

5. Start the frontend

    From the project root:
    npm run dev
    The frontend will run on:
    http://localhost:5173

6. Start the Express server

    In another terminal:
    cd server
    node server.js
    The API will run on:
    http://localhost:3000

7. Start the OCR service
    From the python-ocr directory, install the required Python packages and start the Flask server.
    The local OCR service runs on:
    http://localhost:5001

## API Overview
### Authentication
POST /api/signup
POST /api/login
POST /api/logout
GET  /api/me
### Transactions
GET    /api/transactions
POST   /api/transactions
PATCH  /api/transactions/:id
DELETE /api/transactions/:id
### Budgets
GET    /api/budgets
POST   /api/budgets
PATCH  /api/budgets/:id
DELETE /api/budgets/:id
### Receipt OCR
POST /api/scan-receipt

## Database Structure
The main PostgreSQL tables are:
### Users
Stores authenticated users and hashed passwords.

users
├── id
├── username
└── password

### Transactions
Stores user transactions.

transactions
├── id
├── type
├── amount
├── category
├── description
├── date
└── user_id

### Budgets
Stores monthly category budgets.

budgets
├── id
├── month
├── category
├── amount
└── user_id

### Sessions
Server-side authentication sessions are stored in PostgreSQL using connect-pg-simple.

## What I Learned

This project was built to practice full-stack development and helped me work with:

React components and state
React hooks such as useState and useEffect
React Router
REST APIs
HTTP methods
JSON
Express
Authentication and authorization
Password hashing with bcrypt
Server-side sessions
Cookies and CORS
PostgreSQL and SQL
Database relationships
Async JavaScript and fetch
File uploads
OCR processing
Python and Flask
Docker
Environment variables
Git and GitHub
Cloud deployment
Connecting multiple deployed services

## Deployment
The application is deployed using separate services:

Frontend → Vercel
Backend → Render
OCR → Render
Database → Neon PostgreSQL

This separation allowed me to practice connecting a frontend, backend, database, and external processing service into one full-stack application.

## Future Improvements
Potential improvements include:

Improve OCR accuracy for difficult receipts
Handle OCR service cold starts more gracefully
Improve mobile authentication/session behavior
Add stronger transaction validation
Add additional financial analytics
Add recurring transactions
Add export functionality
Add more visualizations
Improve accessibility
Add automated tests

## Project Status

The core application is complete and deployed. The main functionality has been tested in the production environment, including authentication, transactions, budgets, monthly filtering, and receipt scanning.

Built with React, Express, PostgreSQL, Python, and Docker.