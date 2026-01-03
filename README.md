# 🌍 GlobeTrotter - Empowering Personalized Travel Planning

GlobeTrotter is a comprehensive, full-stack travel planning application that enables users to create personalized multi-city itineraries, manage budgets, discover destinations, and share their travel plans.

## ✨ Features

### Core Functionality
- **User Authentication** - Secure signup, login, and session management
- **Trip Management** - Create, edit, and delete multi-city trips
- **Itinerary Builder** - Add cities, assign dates, and organize activities
- **City & Activity Search** - Discover destinations and activities with filters
- **Budget Tracking** - Visual budget breakdowns with charts and cost analysis
- **Sharing** - Share itineraries via public links
- **User Profiles** - Manage account settings and preferences

### Technical Highlights
- **Modern Stack** - Next.js 14, TypeScript, Prisma, NextAuth
- **Responsive Design** - Mobile-friendly UI with Tailwind CSS
- **Relational Database** - PostgreSQL with comprehensive schema
- **RESTful API** - Well-structured API endpoints
- **Type Safety** - Full TypeScript implementation
- **Component-Based** - Reusable UI components

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐
│   Next.js App   │
│  (Frontend +    │
│   API Routes)   │
└────────┬────────┘
         │
         │ Prisma ORM
         │
┌────────▼────────┐
│   PostgreSQL    │
│    Database     │
└─────────────────┘
```

### Database Schema

The application uses a relational database with the following main entities:

- **Users** - User accounts with authentication
- **Trips** - Travel plans with dates and budgets
- **Cities** - Destination information
- **TripStops** - Cities within trips with arrival/departure dates
- **Activities** - Things to do in cities
- **Expenses** - Budget tracking entries
- **SharedItineraries** - Public sharing links

See `prisma/schema.prisma` for the complete schema definition.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd globetrotter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/globetrotter?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # (Optional) Seed the database
   npx ts-node prisma/seed.ts
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Credentials

After seeding, you can login with:
- **Admin**: `admin@globetrotter.com` / `admin123`
- **User**: `user@globetrotter.com` / `admin123`

## 📁 Project Structure

```
globetrotter/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── trips/         # Trip management
│   │   ├── cities/        # City search
│   │   └── activities/    # Activity search
│   ├── auth/              # Auth pages (login, signup)
│   ├── dashboard/         # Dashboard page
│   ├── trips/             # Trip pages
│   ├── cities/            # City exploration
│   ├── profile/           # User profile
│   └── shared/            # Shared itinerary view
├── components/            # React components
│   ├── ui/               # UI components (Button, Input, Card)
│   └── layout/            # Layout components (Navbar, Layout)
├── lib/                   # Utility libraries
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # NextAuth configuration
│   └── api-helpers.ts    # API helper functions
├── prisma/                # Database schema
│   ├── schema.prisma     # Prisma schema
│   └── seed.ts           # Database seeding
└── types/                 # TypeScript type definitions
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Trips
- `GET /api/trips` - List user's trips
- `POST /api/trips` - Create new trip
- `GET /api/trips/[id]` - Get trip details
- `PATCH /api/trips/[id]` - Update trip
- `DELETE /api/trips/[id]` - Delete trip

### Trip Stops
- `GET /api/trips/[id]/stops` - Get trip stops
- `POST /api/trips/[id]/stops` - Add stop to trip
- `PATCH /api/trips/[id]/stops/[stopId]` - Update stop
- `DELETE /api/trips/[id]/stops/[stopId]` - Remove stop

### Activities
- `GET /api/activities` - Search activities
- `POST /api/trips/[id]/activities` - Add activity to trip
- `DELETE /api/trips/[id]/activities` - Remove activity

### Cities
- `GET /api/cities` - Search cities

### Budget
- `GET /api/trips/[id]/budget` - Get budget breakdown

### Sharing
- `POST /api/trips/[id]/share` - Generate share link
- `GET /api/shared/[token]` - Get shared itinerary

## 🎨 UI/UX Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI** - Clean, intuitive interface with Tailwind CSS
- **Smooth Animations** - Framer Motion for enhanced UX
- **Form Validation** - Client and server-side validation
- **Error Handling** - User-friendly error messages
- **Loading States** - Visual feedback during operations

## 🗄️ Database Schema

### Key Tables

**Users**
- Authentication and profile information
- Role-based access (USER, ADMIN)

**Trips**
- Trip metadata (name, dates, budget)
- Visibility settings (PRIVATE, PUBLIC, SHARED)
- Share tokens for public access

**TripStops**
- Cities within trips
- Arrival and departure dates
- Ordering for itinerary sequence

**Activities**
- Things to do in cities
- Categories (SIGHTSEEING, FOOD, ADVENTURE, etc.)
- Cost and duration information

**Expenses**
- Budget tracking entries
- Categorized expenses (TRANSPORT, ACCOMMODATION, etc.)

See `prisma/schema.prisma` for complete schema with relationships.

## 🔒 Security

- Password hashing with bcrypt
- JWT-based session management
- API route protection
- Input validation with Zod
- SQL injection prevention via Prisma

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The application can be deployed to any platform supporting Next.js:
- Railway
- Render
- AWS Amplify
- DigitalOcean App Platform

Ensure PostgreSQL database is accessible and environment variables are set.

## 📝 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Prisma Studio

### Adding New Features

1. Update Prisma schema if needed
2. Run `npm run db:push`
3. Create API routes in `app/api/`
4. Build frontend components
5. Add pages in `app/`

## 🧪 Testing

Test credentials are seeded by default:
- Email: `user@globetrotter.com`
- Password: `admin123`

## 📚 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Charts**: Chart.js / react-chartjs-2
- **UI Components**: Radix UI
- **Form Handling**: React Hook Form
- **Validation**: Zod

## 🎯 Future Enhancements

- [ ] Calendar/Timeline view with drag-and-drop
- [ ] Real-time collaboration
- [ ] Mobile app (React Native)
- [ ] Integration with booking APIs
- [ ] Weather forecasts
- [ ] Currency conversion
- [ ] Offline support
- [ ] Advanced analytics
- [ ] Social features (follow users, like trips)
- [ ] AI-powered trip suggestions

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@globetrotter.com or open an issue in the repository.

---

Built with ❤️ for travelers around the world 🌍
