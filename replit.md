# Project & Resource Management System

## Overview
A complete project and resource management system with invoicing capabilities. Built with Angular frontend and Node.js/Express backend using PostgreSQL database.

## Tech Stack
- **Frontend**: Angular 21 with PrimeNG v19 UI components
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **PDF Generation**: jsPDF with autotable

## Project Structure
```
/
├── client/                 # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Feature components
│   │   │   │   ├── clients/
│   │   │   │   ├── team-members/
│   │   │   │   ├── projects/
│   │   │   │   ├── time-entries/
│   │   │   │   ├── invoices/
│   │   │   │   └── layout/
│   │   │   ├── services/    # API service
│   │   │   └── models/      # TypeScript interfaces
│   │   └── styles.scss
│   └── angular.json
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   └── db.ts              # Database connection
├── shared/
│   └── schema.ts          # Drizzle database schema
├── package.json
└── drizzle.config.ts
```

## Features

### Clients Module
- Create, view, edit, delete clients
- Fields: ClientName, Email, Phone, Address

### Team Members Module
- Create team members with billing configuration
- Fields: Name, Email, Role, BillingType (hourly/monthly), Rate

### Projects Module
- Create projects under a client
- Assign team members to projects
- Fields: ProjectName, ClientId, Description, StartDate, EndDate, Status

### Time Tracking
- Log working hours/days for team members on projects
- Filter by project, team member, date range
- Automatic amount calculation based on billing type

### Invoice Generation
- Generate invoices by client, project, and date range
- Automatic calculation of totals based on billing type
- PDF export with invoice details
- Invoice status management (draft, sent, paid, overdue)

## Billing Calculations
- **Hourly**: hours × rate
- **Monthly**: (monthly_rate / 22 working days) × days worked

## Running the Application
The development server runs both backend (port 3000) and frontend (port 5000).

```bash
npm run dev
```

## Database Commands
```bash
npm run db:push    # Push schema changes to database
npm run db:studio  # Open Drizzle Studio
```

## API Endpoints
- `GET/POST /api/clients` - Client operations
- `GET/POST /api/team-members` - Team member operations
- `GET/POST /api/projects` - Project operations
- `GET/POST /api/time-entries` - Time entry operations
- `GET/POST /api/invoices` - Invoice operations
- `POST /api/invoices/generate` - Generate new invoice
