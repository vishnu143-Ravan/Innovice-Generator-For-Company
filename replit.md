# Uniquode Projects

## Overview
A complete project and resource management system with invoicing capabilities for Uniquode. Built with Angular frontend using PrimeNG for data grids and Bootstrap for styling, Node.js/Express backend, and PostgreSQL database.

## Tech Stack
- **Frontend**: Angular 21 with PrimeNG v19 (DataTables, Dialogs, Forms) and Bootstrap 5 for styling
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
│   │   └── styles.scss      # Bootstrap import
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
- Server-side calculation of totals based on billing type
- PDF export with invoice details
- Invoice status management (draft, sent, paid, overdue)

## Billing Calculations (Server-Side)
- **Hourly**: hours × rate
- **Monthly**: (monthly_rate / 22 working days) × days worked
  - Invoice line items show daily rate for clarity

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
- `POST /api/invoices/generate` - Generate new invoice (server-side calculations)

## UI Components
- **PrimeNG**: DataTables with sorting, pagination, and filtering
- **Bootstrap 5**: Layout, cards, badges, buttons, and utility classes

## Multi-Language Support
The application supports English and French languages with a language switcher in the header.

### Translation Files
- `client/src/assets/i18n/en.json` - English translations
- `client/src/assets/i18n/fr.json` - French translations

### Usage
- Click EN or FR buttons in the top-right corner to switch languages
- Language preference is saved in browser localStorage
