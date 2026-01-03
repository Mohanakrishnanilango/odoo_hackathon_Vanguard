# Database Schema Documentation

## Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    User     │────────▶│    Trip     │────────▶│  TripStop   │
└─────────────┘         └─────────────┘         └──────┬───────┘
       │                       │                        │
       │                       │                        │
       │                       ▼                        │
       │                ┌─────────────┐                │
       │                │   Expense   │                │
       │                └─────────────┘                │
       │                                                │
       │                       │                        │
       │                       │                        │
       ▼                       ▼                        ▼
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│ SavedCity   │────────▶│    City    │◀────────│  Activity   │
└─────────────┘         └─────────────┘         └──────┬───────┘
                                                       │
                                                       │
                                              ┌────────▼────────┐
                                              │   TripStop      │
                                              │  (junction)     │
                                              └─────────────────┘
```

## Tables

### Users

Stores user account information and authentication data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (CUID) | PK | Unique identifier |
| email | String | UNIQUE, NOT NULL | User email address |
| password | String | NOT NULL | Hashed password (bcrypt) |
| name | String? | NULL | User's full name |
| avatar | String? | NULL | Avatar image URL |
| language | String | DEFAULT 'en' | Language preference |
| role | UserRole | DEFAULT USER | User role (USER/ADMIN) |
| createdAt | DateTime | DEFAULT now() | Account creation timestamp |
| updatedAt | DateTime | AUTO | Last update timestamp |

**Relationships:**
- One-to-Many with `Trip`
- One-to-Many with `SavedCity`
- One-to-Many with `SharedItinerary`

**Indexes:**
- `email` (unique)

---

### Trips

Represents a travel plan with dates, budget, and metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (CUID) | PK | Unique identifier |
| name | String | NOT NULL | Trip name |
| description | String? | NULL | Trip description |
| startDate | DateTime | NOT NULL | Trip start date |
| endDate | DateTime | NOT NULL | Trip end date |
| coverPhoto | String? | NULL | Cover image URL |
| budget | Float | DEFAULT 0 | Total budget amount |
| visibility | TripVisibility | DEFAULT PRIVATE | Visibility setting |
| shareToken | String? | UNIQUE | Token for public sharing |
| userId | String | FK → User.id | Trip owner |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO | Last update timestamp |

**Relationships:**
- Many-to-One with `User`
- One-to-Many with `TripStop`
- One-to-Many with `Expense`
- One-to-Many with `SharedItinerary`

**Indexes:**
- `userId`
- `shareToken` (unique)

**Enums:**
- `TripVisibility`: PRIVATE, PUBLIC, SHARED

---

### Cities

Stores destination information including location and metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (CUID) | PK | Unique identifier |
| name | String | NOT NULL | City name |
| country | String | NOT NULL | Country name |
| countryCode | String | NOT NULL | ISO country code |
| region | String? | NULL | Region/state |
| latitude | Float? | NULL | GPS latitude |
| longitude | Float? | NULL | GPS longitude |
| popularity | Int | DEFAULT 0 | Popularity score (0-100) |
| costIndex | Float | DEFAULT 0 | Cost index (0-100) |
| description | String? | NULL | City description |
| imageUrl | String? | NULL | City image URL |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO | Last update timestamp |

**Relationships:**
- One-to-Many with `TripStop`
- One-to-Many with `Activity`
- One-to-Many with `SavedCity`

**Indexes:**
- `name` + `country` (composite unique)
- `name`
- `country`

---

### TripStops

Junction table linking trips to cities with visit dates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (CUID) | PK | Unique identifier |
| order | Int | NOT NULL | Sequence in itinerary |
| arrivalDate | DateTime | NOT NULL | Arrival date/time |
| departureDate | DateTime | NOT NULL | Departure date/time |
| tripId | String | FK → Trip.id | Parent trip |
| cityId | String | FK → City.id | City visited |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO | Last update timestamp |

**Relationships:**
- Many-to-One with `Trip`
- Many-to-One with `City`
- One-to-Many with `Activity`

**Indexes:**
- `tripId`
- `cityId`

---

### Activities

Things to do in cities, can be added to trip stops.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (CUID) | PK | Unique identifier |
| name | String | NOT NULL | Activity name |
| description | String? | NULL | Activity description |
| category | ActivityCategory | NOT NULL | Activity category |
| cost | Float | DEFAULT 0 | Estimated cost |
| duration | Int | DEFAULT 60 | Duration in minutes |
| imageUrl | String? | NULL | Activity image URL |
| address | String? | NULL | Physical address |
| latitude | Float? | NULL | GPS latitude |
| longitude | Float? | NULL | GPS longitude |
| rating | Float? | DEFAULT 0 | User rating (0-5) |
| cityId | String | FK → City.id | City where activity is |
| stopId | String? | FK → TripStop.id | Trip stop (if added) |
| startTime | DateTime? | NULL | Scheduled start time |
| endTime | DateTime? | NULL | Scheduled end time |
| order | Int | DEFAULT 0 | Order within stop |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO | Last update timestamp |

**Relationships:**
- Many-to-One with `City`
- Many-to-One with `TripStop` (optional)

**Indexes:**
- `cityId`
- `stopId`
- `category`

**Enums:**
- `ActivityCategory`: SIGHTSEEING, FOOD, ADVENTURE, CULTURE, NIGHTLIFE, SHOPPING, NATURE, SPORTS, RELAXATION, OTHER

---

### Expenses

Tracks actual spending for budget management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (CUID) | PK | Unique identifier |
| amount | Float | NOT NULL | Expense amount |
| category | String | NOT NULL | Expense category |
| description | String? | NULL | Expense description |
| date | DateTime | NOT NULL | Expense date |
| tripId | String | FK → Trip.id | Parent trip |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO | Last update timestamp |

**Relationships:**
- Many-to-One with `Trip`

**Indexes:**
- `tripId`
- `date`

**Categories:**
- TRANSPORT
- ACCOMMODATION
- ACTIVITY
- MEAL
- OTHER

---

### SavedCities

User's saved/favorite cities.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (CUID) | PK | Unique identifier |
| userId | String | FK → User.id | User who saved |
| cityId | String | FK → City.id | Saved city |
| createdAt | DateTime | DEFAULT now() | Save timestamp |

**Relationships:**
- Many-to-One with `User`
- Many-to-One with `City`

**Indexes:**
- `userId` + `cityId` (composite unique)
- `userId`

---

### SharedItineraries

Tracks shared trip links and view analytics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (CUID) | PK | Unique identifier |
| token | String | UNIQUE | Share token |
| expiresAt | DateTime? | NULL | Expiration date |
| viewCount | Int | DEFAULT 0 | Number of views |
| tripId | String | FK → Trip.id | Shared trip |
| sharedBy | String | FK → User.id | User who shared |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO | Last update timestamp |

**Relationships:**
- Many-to-One with `Trip`
- Many-to-One with `User`

**Indexes:**
- `token` (unique)
- `tripId`

---

## Data Types

### Enums

**UserRole**
- `USER` - Regular user
- `ADMIN` - Administrator

**ActivityCategory**
- `SIGHTSEEING` - Tourist attractions
- `FOOD` - Restaurants, cafes
- `ADVENTURE` - Outdoor activities
- `CULTURE` - Museums, galleries
- `NIGHTLIFE` - Bars, clubs
- `SHOPPING` - Shopping areas
- `NATURE` - Parks, nature
- `SPORTS` - Sports activities
- `RELAXATION` - Spas, wellness
- `OTHER` - Other activities

**TripVisibility**
- `PRIVATE` - Only owner can view
- `PUBLIC` - Publicly visible
- `SHARED` - Shared via link

---

## Relationships Summary

1. **User → Trip** (1:N)
   - One user can have many trips
   - Cascade delete: deleting user deletes trips

2. **Trip → TripStop** (1:N)
   - One trip has many stops (cities)
   - Cascade delete: deleting trip deletes stops

3. **City → TripStop** (1:N)
   - One city can appear in many trip stops
   - Allows multiple visits to same city

4. **TripStop → Activity** (1:N)
   - One stop can have many activities
   - Activities can exist without being in a trip

5. **City → Activity** (1:N)
   - One city has many available activities
   - Activities are reusable across trips

6. **Trip → Expense** (1:N)
   - One trip has many expenses
   - Cascade delete: deleting trip deletes expenses

7. **User → SavedCity** (1:N)
   - One user can save many cities
   - Many-to-many relationship via junction table

8. **Trip → SharedItinerary** (1:N)
   - One trip can have multiple share links
   - Tracks sharing history and analytics

---

## Indexes

Indexes are created for:
- Primary keys (automatic)
- Foreign keys (for join performance)
- Unique constraints
- Search fields (city name, country)
- Composite keys (user + city for saved cities)

---

## Constraints

- **Foreign Key Constraints**: Ensure referential integrity
- **Unique Constraints**: Prevent duplicates (email, share tokens)
- **Check Constraints**: Can be added for data validation
- **Cascade Deletes**: Maintain data consistency

---

## Sample Queries

### Get trip with all stops and activities
```prisma
trip.findUnique({
  where: { id },
  include: {
    stops: {
      include: {
        city: true,
        activities: true
      }
    }
  }
})
```

### Search cities by name
```prisma
city.findMany({
  where: {
    name: { contains: search, mode: 'insensitive' }
  }
})
```

### Get user's upcoming trips
```prisma
trip.findMany({
  where: {
    userId,
    endDate: { gte: new Date() }
  },
  orderBy: { startDate: 'asc' }
})
```

