# Budget Tracker
A full-stack personal finance application for tracking income, expenses, budgets, and receipt-based transactions. Built with React, Express, PostgreSQL, and a Python OCR service, with authentication, cloud deployment, and responsive interface

# Tech Stack
## Frontend
* React
* Vite
* React Router
* Recharts
* CSS
## Backend
* Node.js
* Express
* pg
* Express Session
## OCR 
* Python
* Flask
* OpenCV
* Tesseract OCR
* Docker
## Database
* PostgreSQL
* Neon
## Deployment
* Vercel
* Render
* Neon

# Architecture
```
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
            |     │
 PostgreSQL │     │ OCR
            │     │
            ▼     ▼
   ┌──────────┐ ┌──────────────┐
   │  Neon    │ │    Render    │
   │PostgreSQL│ │ Python OCR   │
   └──────────┘ │ Tesseract    │
                └──────────────┘
```

# Features
## Authentication
* User signup and login
* Password hashing with bcrypt
* Server-side session authentication
* User-specific data protection

## Transactions
* Create, edit, and delete income and expenses
* Categories, descriptions, and dates
* Search and filtering
* Monthly transaction views

## Dashboard & Budgets
* Income, expenses, and balance summaries
* Spending breakdown by category
* Monthly financial summaries
* Create, edit, and delete category budgets
* Track budgets independently for each user

## Receipt Scanning
* Upload or capture receipt images
* Extract receipt information using OCR 
* Review and edit extracted data
* Save scanned receipts as expenses

# Running Locally
1. Clone and install
    * git clone https://github.com/vienna921/budget-tracker.git
    * cd budget-tracker
    * npm install
    * cd server
    * npm install
    * cd ..
2. Configure environment variables
    * Create .env files using the required local configuration:
    # Frontend
    VITE_API_URL=http://localhost:3000

    # Backend
    DATABASE_URL=your_postgresql_connection_string
    SESSION_SECRET=your_session_secret
    FRONTEND_URL=http://localhost:5173
    NODE_ENV=development
    OCR_URL=http://localhost:5001

3. Start services
    Run each service in a separate terminal.
    # frontend
    npm run dev
    # Express server
    cd server
    node server.js
    # OCR service
    From python-ocr directory, install the required Python packages and start Flask server.

# Deployment
Frontend: Vercel
Backend: Render
OCR: Render
Database: Neon PostgreSQL



