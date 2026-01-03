# API Documentation

## Base URL

Development: `http://localhost:3000/api`
Production: `https://your-domain.com/api`

## Authentication

Most endpoints require authentication via NextAuth session. Include session cookie in requests.

---

## Authentication Endpoints

### Register User

**POST** `/api/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "message": "User created successfully",
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors:**
- `400` - Invalid input or user already exists
- `500` - Server error

---

### Login

**POST** `/api/auth/[...nextauth]`

Login via NextAuth. Use NextAuth client methods in frontend.

---

## Trip Endpoints

### List Trips

**GET** `/api/trips`

Get all trips for authenticated user.

**Query Parameters:**
- `upcoming` (boolean) - Filter upcoming trips only

**Response:** `200 OK`
```json
{
  "trips": [
    {
      "id": "clx...",
      "name": "European Adventure",
      "startDate": "2024-06-01T00:00:00.000Z",
      "endDate": "2024-06-15T00:00:00.000Z",
      "budget": 2500,
      "_count": {
        "stops": 3
      }
    }
  ]
}
```

---

### Create Trip

**POST** `/api/trips`

Create a new trip.

**Request Body:**
```json
{
  "name": "European Adventure",
  "description": "A week-long journey",
  "startDate": "2024-06-01T00:00:00.000Z",
  "endDate": "2024-06-15T00:00:00.000Z",
  "budget": 2500,
  "coverPhoto": "https://example.com/image.jpg"
}
```

**Response:** `201 Created`
```json
{
  "trip": {
    "id": "clx...",
    "name": "European Adventure",
    ...
  }
}
```

---

### Get Trip

**GET** `/api/trips/[id]`

Get trip details with stops and activities.

**Response:** `200 OK`
```json
{
  "trip": {
    "id": "clx...",
    "name": "European Adventure",
    "stops": [
      {
        "id": "clx...",
        "city": {
          "id": "clx...",
          "name": "Paris",
          "country": "France"
        },
        "arrivalDate": "2024-06-01T00:00:00.000Z",
        "departureDate": "2024-06-05T00:00:00.000Z",
        "activities": [...]
      }
    ],
    "expenses": [...]
  }
}
```

**Errors:**
- `401` - Unauthorized
- `404` - Trip not found

---

### Update Trip

**PATCH** `/api/trips/[id]`

Update trip information.

**Request Body:**
```json
{
  "name": "Updated Name",
  "budget": 3000,
  "visibility": "PUBLIC"
}
```

**Response:** `200 OK`
```json
{
  "trip": { ... }
}
```

---

### Delete Trip

**DELETE** `/api/trips/[id]`

Delete a trip and all associated data.

**Response:** `200 OK`
```json
{
  "message": "Trip deleted successfully"
}
```

---

## Trip Stop Endpoints

### List Stops

**GET** `/api/trips/[id]/stops`

Get all stops for a trip.

**Response:** `200 OK`
```json
{
  "stops": [
    {
      "id": "clx...",
      "order": 1,
      "city": {
        "id": "clx...",
        "name": "Paris",
        "country": "France"
      },
      "arrivalDate": "2024-06-01T00:00:00.000Z",
      "departureDate": "2024-06-05T00:00:00.000Z",
      "activities": [...]
    }
  ]
}
```

---

### Add Stop

**POST** `/api/trips/[id]/stops`

Add a city stop to a trip.

**Request Body:**
```json
{
  "cityId": "clx...",
  "arrivalDate": "2024-06-01T00:00:00.000Z",
  "departureDate": "2024-06-05T00:00:00.000Z",
  "order": 1
}
```

**Response:** `201 Created`
```json
{
  "stop": {
    "id": "clx...",
    "city": { ... },
    ...
  }
}
```

---

### Update Stop

**PATCH** `/api/trips/[id]/stops/[stopId]`

Update stop dates or order.

**Request Body:**
```json
{
  "arrivalDate": "2024-06-02T00:00:00.000Z",
  "order": 2
}
```

**Response:** `200 OK`
```json
{
  "stop": { ... }
}
```

---

### Delete Stop

**DELETE** `/api/trips/[id]/stops/[stopId]`

Remove a stop from a trip.

**Response:** `200 OK`
```json
{
  "message": "Stop deleted successfully"
}
```

---

## Activity Endpoints

### Search Activities

**GET** `/api/activities`

Search for activities.

**Query Parameters:**
- `cityId` (string) - Filter by city
- `category` (string) - Filter by category
- `minCost` (number) - Minimum cost
- `maxCost` (number) - Maximum cost
- `maxDuration` (number) - Maximum duration in minutes
- `search` (string) - Search by name/description
- `limit` (number) - Results limit (default: 50)
- `offset` (number) - Pagination offset

**Response:** `200 OK`
```json
{
  "activities": [
    {
      "id": "clx...",
      "name": "Eiffel Tower",
      "category": "SIGHTSEEING",
      "cost": 25,
      "duration": 120,
      "city": {
        "id": "clx...",
        "name": "Paris",
        "country": "France"
      }
    }
  ],
  "total": 50,
  "limit": 50,
  "offset": 0
}
```

---

### Add Activity to Trip

**POST** `/api/trips/[id]/activities`

Add an activity to a trip stop.

**Request Body:**
```json
{
  "activityId": "clx...",
  "stopId": "clx...",
  "startTime": "2024-06-01T10:00:00.000Z",
  "order": 1
}
```

**Response:** `200 OK`
```json
{
  "activity": { ... }
}
```

---

### Remove Activity from Trip

**DELETE** `/api/trips/[id]/activities?activityId=clx...`

Remove an activity from a trip stop.

**Response:** `200 OK`
```json
{
  "message": "Activity removed successfully"
}
```

---

## City Endpoints

### Search Cities

**GET** `/api/cities`

Search for cities.

**Query Parameters:**
- `search` (string) - Search by name or country
- `country` (string) - Filter by country
- `limit` (number) - Results limit (default: 50)
- `offset` (number) - Pagination offset

**Response:** `200 OK`
```json
{
  "cities": [
    {
      "id": "clx...",
      "name": "Paris",
      "country": "France",
      "countryCode": "FR",
      "costIndex": 75,
      "popularity": 95,
      "description": "...",
      "imageUrl": "..."
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

---

## Budget Endpoints

### Get Budget Breakdown

**GET** `/api/trips/[id]/budget`

Get detailed budget analysis for a trip.

**Response:** `200 OK`
```json
{
  "budget": {
    "totalBudget": 2500,
    "totalEstimated": 2200,
    "totalExpenses": 500,
    "costPerDay": 157.14,
    "days": 14,
    "breakdown": {
      "transport": 800,
      "accommodation": 1000,
      "activities": 300,
      "meals": 200,
      "other": 100
    },
    "overBudget": false,
    "remaining": 300
  }
}
```

---

## Sharing Endpoints

### Generate Share Link

**POST** `/api/trips/[id]/share`

Generate a shareable link for a trip.

**Response:** `200 OK`
```json
{
  "shareToken": "abc123...",
  "shareUrl": "http://localhost:3000/shared/abc123..."
}
```

---

### Get Shared Itinerary

**GET** `/api/shared/[token]`

Get a shared trip by token (public, no auth required).

**Response:** `200 OK`
```json
{
  "trip": {
    "id": "clx...",
    "name": "European Adventure",
    "stops": [...],
    "user": {
      "name": "John Doe"
    }
  }
}
```

**Errors:**
- `404` - Shared itinerary not found

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": [...] // Optional, for validation errors
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding for production.

---

## Pagination

Endpoints that return lists support pagination via `limit` and `offset` query parameters.

Example:
```
GET /api/cities?limit=20&offset=40
```

Returns items 41-60.

---

## Filtering and Sorting

Most list endpoints support:
- **Filtering** via query parameters
- **Search** via `search` parameter
- **Sorting** (defaults vary by endpoint)

---

## Data Validation

All input is validated using Zod schemas. Invalid input returns `400` with error details.

