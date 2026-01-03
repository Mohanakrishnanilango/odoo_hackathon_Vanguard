# System Architecture

## Overview

GlobeTrotter is built using a modern full-stack architecture with Next.js serving both the frontend and backend API.

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **Chart.js** - Data visualization

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Type-safe database ORM
- **NextAuth.js** - Authentication solution
- **PostgreSQL** - Relational database

### Development Tools
- **TypeScript** - Static type checking
- **ESLint** - Code linting
- **Prisma Studio** - Database GUI

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   React UI   │  │  Next.js App │  │   API Calls   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘ │
└─────────┼─────────────────┼─────────────────┼──────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
          ┌─────────────────▼─────────────────┐
          │      Next.js Server (Node.js)     │
          │  ┌──────────────────────────────┐ │
          │  │      API Routes              │ │
          │  │  - /api/auth/*               │ │
          │  │  - /api/trips/*              │ │
          │  │  - /api/cities/*             │ │
          │  │  - /api/activities/*        │ │
          │  └──────────┬───────────────────┘ │
          │             │                     │
          │  ┌──────────▼───────────────────┐ │
          │  │   Business Logic Layer       │ │
          │  │  - Authentication            │ │
          │  │  - Authorization             │ │
          │  │  - Data Validation           │ │
          │  └──────────┬───────────────────┘ │
          │             │                     │
          │  ┌──────────▼───────────────────┐ │
          │  │      Prisma ORM              │ │
          │  └──────────┬───────────────────┘ │
          └─────────────┼─────────────────────┘
                        │
          ┌─────────────▼─────────────┐
          │    PostgreSQL Database     │
          │  ┌──────────────────────┐  │
          │  │  - Users            │  │
          │  │  - Trips            │  │
          │  │  - Cities           │  │
          │  │  - Activities       │  │
          │  │  - Expenses        │  │
          │  └──────────────────────┘  │
          └─────────────────────────────┘
```

## Data Flow

### Authentication Flow
1. User submits login form
2. Frontend calls `/api/auth/[...nextauth]`
3. NextAuth validates credentials
4. Session created and stored
5. User redirected to dashboard

### Trip Creation Flow
1. User fills trip form
2. Frontend validates input
3. POST request to `/api/trips`
4. API validates and creates trip in database
5. Response with trip data
6. Frontend redirects to itinerary builder

### Itinerary Building Flow
1. User searches for cities
2. Frontend calls `/api/cities?search=...`
3. User selects city and adds to trip
4. POST to `/api/trips/[id]/stops`
5. Stop created with city reference
6. User adds activities to stop
7. Activities linked to stop via `/api/trips/[id]/activities`

## Database Schema

### Entity Relationships

```
User
  ├── has many → Trip
  ├── has many → SavedCity
  └── has many → SharedItinerary

Trip
  ├── belongs to → User
  ├── has many → TripStop
  ├── has many → Expense
  └── has many → SharedItinerary

TripStop
  ├── belongs to → Trip
  ├── belongs to → City
  └── has many → Activity

City
  ├── has many → TripStop
  ├── has many → Activity
  └── has many → SavedCity

Activity
  ├── belongs to → City
  └── optionally belongs to → TripStop
```

### Key Design Decisions

1. **TripStops as Junction Table**
   - Allows multiple visits to same city
   - Tracks arrival/departure dates per visit
   - Maintains order within trip

2. **Activities Linked to Both City and Stop**
   - Activities exist at city level (reusable)
   - When added to trip, linked to specific stop
   - Allows same activity in multiple trips

3. **Expenses Separate from Activities**
   - Activities have estimated costs
   - Expenses track actual spending
   - Enables budget vs actual comparison

4. **Share Tokens**
   - Unique token per shared trip
   - Stored in Trip table for quick lookup
   - Separate SharedItinerary table for analytics

## API Design

### RESTful Principles
- Resource-based URLs
- HTTP methods for actions (GET, POST, PATCH, DELETE)
- JSON request/response format
- Status codes for errors

### Authentication
- JWT tokens via NextAuth
- Session-based authentication
- Protected routes check session

### Error Handling
- Consistent error response format
- HTTP status codes
- User-friendly error messages
- Server-side logging

## Security Considerations

1. **Password Security**
   - Bcrypt hashing (10 rounds)
   - Never stored in plain text
   - Not returned in API responses

2. **Authorization**
   - User can only access own trips
   - Admin role for future features
   - Share tokens for public access

3. **Input Validation**
   - Zod schemas for validation
   - Type checking with TypeScript
   - SQL injection prevention via Prisma

4. **Session Management**
   - Secure HTTP-only cookies
   - JWT tokens with expiration
   - Automatic session refresh

## Performance Optimizations

1. **Database Indexing**
   - Indexes on foreign keys
   - Indexes on search fields (city name, country)
   - Composite indexes for common queries

2. **API Optimization**
   - Selective field inclusion
   - Pagination for large datasets
   - Efficient queries with Prisma

3. **Frontend Optimization**
   - Next.js automatic code splitting
   - Image optimization
   - Client-side caching

## Scalability

### Current Limitations
- Single database instance
- No caching layer
- No CDN for static assets

### Future Improvements
- Database read replicas
- Redis caching layer
- CDN for images
- Horizontal scaling with load balancer
- Microservices for specific features

## Deployment Architecture

### Development
- Local PostgreSQL
- Next.js dev server
- Hot reload enabled

### Production (Recommended: Vercel)
- Vercel Edge Network
- Managed PostgreSQL (Vercel Postgres or external)
- Environment variables for secrets
- Automatic deployments from Git

### Alternative Deployments
- Docker containers
- Kubernetes orchestration
- Serverless functions (AWS Lambda, etc.)

