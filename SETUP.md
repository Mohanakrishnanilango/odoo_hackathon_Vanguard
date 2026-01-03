# Setup Guide

## Quick Start

Follow these steps to get GlobeTrotter running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd globetrotter
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js and React
- Prisma ORM
- NextAuth
- Tailwind CSS
- And other dependencies

### 3. Set Up PostgreSQL Database

#### Option A: Local PostgreSQL

1. Create a new database:
```sql
CREATE DATABASE globetrotter;
```

2. Note your connection details:
   - Host: `localhost`
   - Port: `5432`
   - Database: `globetrotter`
   - Username: `postgres` (or your username)
   - Password: (your password)

#### Option B: Cloud Database (Recommended for Production)

Use services like:
- **Vercel Postgres**
- **Supabase**
- **Railway**
- **Neon**
- **AWS RDS**

### 4. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Open `.env` and update the following:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/globetrotter?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-key-here"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 5. Set Up the Database Schema

1. Generate Prisma Client:
```bash
npm run db:generate
```

2. Push the schema to your database:
```bash
npm run db:push
```

This creates all tables in your database.

### 6. Seed the Database (Optional)

Populate the database with sample data:

```bash
npm run db:seed
```

This creates:
- Admin user: `admin@globetrotter.com` / `admin123`
- Test user: `user@globetrotter.com` / `admin123`
- Sample cities (Paris, Tokyo, New York, London, Barcelona)
- Sample activities
- A sample trip

### 7. Start the Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

### 8. Verify Installation

1. Open [http://localhost:3000](http://localhost:3000)
2. You should be redirected to the login page
3. Login with seeded credentials:
   - Email: `user@globetrotter.com`
   - Password: `admin123`

## Troubleshooting

### Database Connection Issues

**Error:** `Can't reach database server`

**Solutions:**
1. Verify PostgreSQL is running:
```bash
# macOS/Linux
pg_isready

# Windows
# Check Services for PostgreSQL
```

2. Check connection string format:
```
postgresql://username:password@host:port/database?schema=public
```

3. Verify database exists:
```sql
\l  -- List databases
```

### Prisma Issues

**Error:** `Prisma Client not generated`

**Solution:**
```bash
npm run db:generate
```

**Error:** `Schema changes not applied`

**Solution:**
```bash
npm run db:push
```

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
1. Change port in `package.json`:
```json
"dev": "next dev -p 3001"
```

2. Or kill the process using port 3000:
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Module Not Found Errors

**Error:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
npm install
npm run db:generate
```

### Authentication Issues

**Error:** `NEXTAUTH_SECRET is not set`

**Solution:**
1. Ensure `.env` file exists
2. Set `NEXTAUTH_SECRET` to a random string
3. Restart the development server

## Development Workflow

### Making Database Changes

1. Edit `prisma/schema.prisma`
2. Push changes:
```bash
npm run db:push
```

3. Regenerate Prisma Client:
```bash
npm run db:generate
```

### Viewing Database

Use Prisma Studio to view and edit data:

```bash
npm run db:studio
```

Opens at [http://localhost:5555](http://localhost:5555)

### Running Migrations (Production)

For production, use migrations instead of `db:push`:

```bash
npm run db:migrate
```

## Production Deployment

### Environment Variables

Set these in your hosting platform:

- `DATABASE_URL` - Production database URL
- `NEXTAUTH_URL` - Your production domain
- `NEXTAUTH_SECRET` - Strong random secret

### Build for Production

```bash
npm run build
npm start
```

### Recommended Hosting

- **Vercel** (Easiest for Next.js)
- **Railway**
- **Render**
- **AWS Amplify**
- **DigitalOcean App Platform**

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth Documentation](https://next-auth.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review error messages in the console
3. Check database connection
4. Verify environment variables
5. Ensure all dependencies are installed

## Next Steps

After setup:

1. ✅ Explore the dashboard
2. ✅ Create your first trip
3. ✅ Add cities to your itinerary
4. ✅ Search and add activities
5. ✅ Set a budget and track expenses
6. ✅ Share your trip with friends

Happy traveling! 🌍

