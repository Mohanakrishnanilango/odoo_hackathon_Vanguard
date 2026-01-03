import { NextRequest, NextResponse } from 'next/server'

interface Recommendation {
  name: string
  description: string
  category: 'attraction' | 'restaurant' | 'activity' | 'shopping'
  rating: number
  estimatedCost: number
  distance?: string
  imageUrl?: string
}

// Mock recommendations data - in production, you'd use a real travel API
const mockRecommendations: { [key: string]: Recommendation[] } = {
  'tokyo': [
    {
      name: 'Senso-ji Temple',
      description: 'Ancient Buddhist temple and Tokyo\'s oldest temple',
      category: 'attraction',
      rating: 4.5,
      estimatedCost: 0,
      distance: '0.5 km',
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80'
    },
    {
      name: 'Tsukiji Outer Market',
      description: 'Famous fish market with fresh seafood and street food',
      category: 'restaurant',
      rating: 4.3,
      estimatedCost: 15,
      distance: '2 km',
      imageUrl: 'https://images.unsplash.com/photo-1552832230-c9198066b9db?w=400&q=80'
    },
    {
      name: 'Tokyo Skytree',
      description: 'Tallest structure in Japan with observation decks',
      category: 'attraction',
      rating: 4.4,
      estimatedCost: 25,
      distance: '8 km',
      imageUrl: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=400&q=80'
    },
    {
      name: 'Shibuya Crossing',
      description: 'World\'s busiest pedestrian crossing',
      category: 'activity',
      rating: 4.2,
      estimatedCost: 0,
      distance: '3 km',
      imageUrl: 'https://images.unsplash.com/photo-1550989461-0adf9904d8b8?w=400&q=80'
    }
  ],
  'kyoto': [
    {
      name: 'Fushimi Inari Shrine',
      description: 'Famous shrine with thousands of red torii gates',
      category: 'attraction',
      rating: 4.7,
      estimatedCost: 0,
      distance: '2 km',
      imageUrl: 'https://images.unsplash.com/photo-1528164344705-77589bd35c3a?w=400&q=80'
    },
    {
      name: 'Arashiyama Bamboo Grove',
      description: 'Enchanting bamboo forest walkway',
      category: 'activity',
      rating: 4.6,
      estimatedCost: 0,
      distance: '5 km',
      imageUrl: 'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=400&q=80'
    },
    {
      name: 'Kiyomizu-dera Temple',
      description: 'Historic wooden temple with city views',
      category: 'attraction',
      rating: 4.5,
      estimatedCost: 5,
      distance: '3 km',
      imageUrl: 'https://images.unsplash.com/photo-1495567720989-dbdbab4a4b8a?w=400&q=80'
    }
  ],
  'osaka': [
    {
      name: 'Osaka Castle',
      description: 'Historic castle and beautiful gardens',
      category: 'attraction',
      rating: 4.4,
      estimatedCost: 8,
      distance: '1 km',
      imageUrl: 'https://images.unsplash.com/photo-1545569342-9eb8b309b41f?w=400&q=80'
    },
    {
      name: 'Dotonbori District',
      description: 'Vibrant nightlife and street food paradise',
      category: 'activity',
      rating: 4.5,
      estimatedCost: 20,
      distance: '2 km',
      imageUrl: 'https://images.unsplash.com/photo-1555403375-603e2c7d8d46?w=400&q=80'
    }
  ],
  'paris': [
    {
      name: 'Eiffel Tower',
      description: 'Iconic iron lattice tower and symbol of Paris',
      category: 'attraction',
      rating: 4.6,
      estimatedCost: 25,
      distance: '1 km',
      imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&q=80'
    },
    {
      name: 'Louvre Museum',
      description: 'World\'s largest art museum and historic monument',
      category: 'attraction',
      rating: 4.7,
      estimatedCost: 17,
      distance: '2 km',
      imageUrl: 'https://images.unsplash.com/photo-1566472668568-9e2facf89a0f?w=400&q=80'
    },
    {
      name: 'Montmartre',
      description: 'Artistic neighborhood with Sacré-Cœur Basilica',
      category: 'activity',
      rating: 4.5,
      estimatedCost: 0,
      distance: '3 km',
      imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&q=80'
    }
  ]
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get('location')?.toLowerCase()

  if (!location) {
    return NextResponse.json(
      { error: 'Location parameter is required' },
      { status: 400 }
    )
  }

  // Try to find exact match first
  let recommendations = mockRecommendations[location]

  // If no exact match, try partial matches
  if (!recommendations) {
    const cityKey = Object.keys(mockRecommendations).find(key => 
      location.includes(key) || key.includes(location)
    )
    recommendations = cityKey ? mockRecommendations[cityKey] : []
  }

  // If still no recommendations, provide generic ones
  if (!recommendations || recommendations.length === 0) {
    recommendations = [
      {
        name: 'Local City Tour',
        description: 'Explore the city with a guided tour',
        category: 'activity' as const,
        rating: 4.0,
        estimatedCost: 30,
        imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80'
      },
      {
        name: 'Local Market',
        description: 'Visit the local market for authentic experiences',
        category: 'activity' as const,
        rating: 4.2,
        estimatedCost: 10,
        imageUrl: 'https://images.unsplash.com/photo-1525300933185-c6c82a30d6e1?w=400&q=80'
      }
    ]
  }

  return NextResponse.json({ recommendations })
}
