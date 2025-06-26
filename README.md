# CodeBoard

A community-driven platform for collecting, analyzing, and sharing code-switching examples across multiple languages. CodeBoard serves as a comprehensive corpus for linguistic research and language learning insights.

## Overview

CodeBoard is a full-stack web application that enables users to submit real-world examples of code-switching (the practice of alternating between two or more languages in conversation) and provides analytics to understand multilingual communication patterns.

### Current Functionality

**Backend (Fully Functional)**
- RESTful API built with Express.js and TypeScript
- PostgreSQL database with Prisma ORM
- Complete dashboard analytics endpoints
- Search and filtering capabilities
- Sample data for testing and demonstration
- Comprehensive error handling and validation

**Frontend (UI Complete)**
- Next.js 15 with App Router
- Responsive design with Tailwind CSS and Radix UI
- Interactive dashboard with charts (Recharts)
- Example submission and browsing interfaces
- Search and filtering functionality

**Available Features**
- Submit code-switching examples with context
- Browse and search existing examples
- View analytics dashboard with:
  - Language pair statistics
  - Platform distribution
  - Regional analysis
  - Time-based trends
- Reference data for languages, regions, and platforms

## Project Structure

```
CodeBoard/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Request handlers
│   │   ├── utils/         # Utility functions
│   │   └── app.ts         # Main application
│   ├── prisma/            # Database schema and migrations
│   └── package.json
├── frontend/               # Next.js React application
│   ├── app/               # App Router pages
│   ├── components/        # Reusable UI components
│   ├── lib/              # API client and utilities
│   ├── types/            # TypeScript type definitions
│   └── package.json
└── README.md
```

## Setup and Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure your database URL in `.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/codeboard"
   ```

5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The backend API will be available at `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Configure API URL in `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Examples
- `GET /api/examples` - Fetch examples with optional filtering
- `POST /api/examples` - Submit new code-switching example

### Dashboard Analytics
- `GET /api/dashboard/metrics` - Overall statistics
- `GET /api/dashboard/language-pairs` - Language pair analysis
- `GET /api/dashboard/switch-points` - Time-based trends
- `GET /api/dashboard/platforms` - Platform distribution
- `GET /api/dashboard/regions` - Regional statistics

### Reference Data
- `GET /api/reference/languages` - Available languages
- `GET /api/reference/regions` - Available regions
- `GET /api/reference/platforms` - Available platforms

## Database Schema

The application uses PostgreSQL with the following main entities:
- **Examples**: Code-switching examples with metadata
- **Languages**: Supported languages
- **Regions**: Geographic regions
- **Platforms**: Communication platforms

## Current Status

**Phase 1: Core Functionality - Complete**
- Backend API with all endpoints functional
- Database schema and sample data
- Frontend UI with complete user interface
- Basic search and filtering capabilities
- Analytics dashboard with real-time data

**Phase 2: Enhancement - Planned**
- User authentication and authorization
- Advanced search with linguistic annotations
- Export functionality for research data
- API rate limiting and caching
- Enhanced data validation and sanitization
- Batch import capabilities for large datasets

**Phase 3: Advanced Features - Future**
- Machine learning for automatic language detection
- Linguistic analysis tools (POS tagging, syntax analysis)
- Collaborative annotation features
- Integration with external linguistic databases
- Real-time collaboration tools
- Advanced visualization and reporting

## Development Notes

- The system is designed to be linguistically agnostic and can handle any language pair
- Sample data includes diverse examples across multiple languages and regions
- The frontend is prepared for real-time updates and can easily integrate with WebSocket connections
- All API responses follow a consistent format with proper error handling
- The database schema is extensible for future linguistic metadata

## Contributing

The codebase follows standard web development practices:
- TypeScript for type safety
- Prisma for database operations
- RESTful API design principles
- Responsive design with accessibility considerations
- Comprehensive error handling

## Technology Stack

**Backend:**
- Express.js with TypeScript
- Prisma ORM
- PostgreSQL
- Supabase (database hosting)

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Radix UI components
- Recharts for data visualization

**Development Tools:**
- ESLint and Prettier
- TypeScript strict mode
- Hot reloading for development
- Environment-based configuration

This project represents a functional foundation for code-switching research and can be extended with additional features as needed.