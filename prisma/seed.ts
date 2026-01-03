import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌍 Seeding GlobeTrotter database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@globetrotter.com' },
    update: {},
    create: {
      email: 'admin@globetrotter.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: 'user@globetrotter.com' },
    update: {},
    create: {
      email: 'user@globetrotter.com',
      password: hashedPassword,
      name: 'Test User',
    },
  })

  // Create popular cities with images
  const cities = [
    // France
    {
      name: 'Paris',
      country: 'France',
      countryCode: 'FR',
      region: 'Île-de-France',
      latitude: 48.8566,
      longitude: 2.3522,
      popularity: 95,
      costIndex: 75,
      description: 'The City of Light, known for its art, fashion, and culture.',
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    },
    {
      name: 'Nice',
      country: 'France',
      countryCode: 'FR',
      region: 'Provence-Alpes-Côte d\'Azur',
      latitude: 43.7102,
      longitude: 7.2620,
      popularity: 78,
      costIndex: 70,
      description: 'Beautiful Mediterranean city with stunning beaches and vibrant culture.',
      imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    },
    {
      name: 'Lyon',
      country: 'France',
      countryCode: 'FR',
      region: 'Auvergne-Rhône-Alpes',
      latitude: 45.7640,
      longitude: 4.8357,
      popularity: 72,
      costIndex: 68,
      description: 'Historic city known for its cuisine and Renaissance architecture.',
      imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800',
    },
    // Japan
    {
      name: 'Tokyo',
      country: 'Japan',
      countryCode: 'JP',
      region: 'Kanto',
      latitude: 35.6762,
      longitude: 139.6503,
      popularity: 92,
      costIndex: 80,
      description: 'A vibrant metropolis blending tradition and modernity.',
      imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    },
    {
      name: 'Kyoto',
      country: 'Japan',
      countryCode: 'JP',
      region: 'Kansai',
      latitude: 35.0116,
      longitude: 135.7681,
      popularity: 88,
      costIndex: 72,
      description: 'Ancient capital with thousands of temples and traditional gardens.',
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
    },
    {
      name: 'Osaka',
      country: 'Japan',
      countryCode: 'JP',
      region: 'Kansai',
      latitude: 34.6937,
      longitude: 135.5023,
      popularity: 85,
      costIndex: 75,
      description: 'Food capital of Japan with vibrant nightlife and modern architecture.',
      imageUrl: 'https://images.unsplash.com/photo-1578645510449-e8b1c896bb56?w=800',
    },
    // United States
    {
      name: 'New York',
      country: 'United States',
      countryCode: 'US',
      region: 'New York',
      latitude: 40.7128,
      longitude: -74.0060,
      popularity: 98,
      costIndex: 85,
      description: 'The city that never sleeps, a global hub of culture and commerce.',
      imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
    },
    {
      name: 'Los Angeles',
      country: 'United States',
      countryCode: 'US',
      region: 'California',
      latitude: 34.0522,
      longitude: -118.2437,
      popularity: 90,
      costIndex: 82,
      description: 'Entertainment capital with beaches, Hollywood, and diverse culture.',
      imageUrl: 'https://images.unsplash.com/photo-1515896578789-8d498816cf07?w=800',
    },
    {
      name: 'San Francisco',
      country: 'United States',
      countryCode: 'US',
      region: 'California',
      latitude: 37.7749,
      longitude: -122.4194,
      popularity: 87,
      costIndex: 88,
      description: 'Tech hub with iconic Golden Gate Bridge and hilly streets.',
      imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
    },
    {
      name: 'Miami',
      country: 'United States',
      countryCode: 'US',
      region: 'Florida',
      latitude: 25.7617,
      longitude: -80.1918,
      popularity: 83,
      costIndex: 78,
      description: 'Tropical paradise with beautiful beaches and vibrant nightlife.',
      imageUrl: 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=800',
    },
    // United Kingdom
    {
      name: 'London',
      country: 'United Kingdom',
      countryCode: 'GB',
      region: 'England',
      latitude: 51.5074,
      longitude: -0.1278,
      popularity: 94,
      costIndex: 78,
      description: 'Historic capital with royal heritage and modern attractions.',
      imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
    },
    {
      name: 'Edinburgh',
      country: 'United Kingdom',
      countryCode: 'GB',
      region: 'Scotland',
      latitude: 55.9533,
      longitude: -3.1883,
      popularity: 82,
      costIndex: 70,
      description: 'Medieval old town and Georgian new town with stunning architecture.',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    },
    // Spain
    {
      name: 'Barcelona',
      country: 'Spain',
      countryCode: 'ES',
      region: 'Catalonia',
      latitude: 41.3851,
      longitude: 2.1734,
      popularity: 88,
      costIndex: 65,
      description: 'Mediterranean city famous for architecture and beaches.',
      imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800',
    },
    {
      name: 'Madrid',
      country: 'Spain',
      countryCode: 'ES',
      region: 'Madrid',
      latitude: 40.4168,
      longitude: -3.7038,
      popularity: 85,
      costIndex: 68,
      description: 'Vibrant capital with world-class museums and nightlife.',
      imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800',
    },
    {
      name: 'Seville',
      country: 'Spain',
      countryCode: 'ES',
      region: 'Andalusia',
      latitude: 37.3891,
      longitude: -5.9845,
      popularity: 75,
      costIndex: 60,
      description: 'Andalusian gem with flamenco, tapas, and Moorish architecture.',
      imageUrl: 'https://images.unsplash.com/photo-1558642452-9f2ea5fdf302?w=800',
    },
    // Italy
    {
      name: 'Rome',
      country: 'Italy',
      countryCode: 'IT',
      region: 'Lazio',
      latitude: 41.9028,
      longitude: 12.4964,
      popularity: 93,
      costIndex: 72,
      description: 'Eternal city with ancient history, art, and incredible cuisine.',
      imageUrl: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=800',
    },
    {
      name: 'Venice',
      country: 'Italy',
      countryCode: 'IT',
      region: 'Veneto',
      latitude: 45.4408,
      longitude: 12.3155,
      popularity: 89,
      costIndex: 75,
      description: 'Romantic city of canals, gondolas, and stunning architecture.',
      imageUrl: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800',
    },
    {
      name: 'Florence',
      country: 'Italy',
      countryCode: 'IT',
      region: 'Tuscany',
      latitude: 43.7696,
      longitude: 11.2558,
      popularity: 86,
      costIndex: 70,
      description: 'Renaissance art capital with stunning cathedrals and museums.',
      imageUrl: 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800',
    },
    {
      name: 'Milan',
      country: 'Italy',
      countryCode: 'IT',
      region: 'Lombardy',
      latitude: 45.4642,
      longitude: 9.1900,
      popularity: 84,
      costIndex: 78,
      description: 'Fashion and design capital with stunning Gothic cathedral.',
      imageUrl: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800',
    },
    // Germany
    {
      name: 'Berlin',
      country: 'Germany',
      countryCode: 'DE',
      region: 'Berlin',
      latitude: 52.5200,
      longitude: 13.4050,
      popularity: 86,
      costIndex: 68,
      description: 'Creative capital with rich history, art scene, and nightlife.',
      imageUrl: 'https://images.unsplash.com/photo-1587330979470-3585ac3ac3cd?w=800',
    },
    {
      name: 'Munich',
      country: 'Germany',
      countryCode: 'DE',
      region: 'Bavaria',
      latitude: 48.1351,
      longitude: 11.5820,
      popularity: 80,
      costIndex: 72,
      description: 'Bavarian capital famous for Oktoberfest and beautiful architecture.',
      imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800',
    },
    // Netherlands
    {
      name: 'Amsterdam',
      country: 'Netherlands',
      countryCode: 'NL',
      region: 'North Holland',
      latitude: 52.3676,
      longitude: 4.9041,
      popularity: 87,
      costIndex: 75,
      description: 'City of canals, museums, and vibrant cultural scene.',
      imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800',
    },
    // Greece
    {
      name: 'Athens',
      country: 'Greece',
      countryCode: 'GR',
      region: 'Attica',
      latitude: 37.9838,
      longitude: 23.7275,
      popularity: 81,
      costIndex: 65,
      description: 'Ancient capital with Acropolis and rich historical heritage.',
      imageUrl: 'https://images.unsplash.com/photo-1603574670812-df7088f3a880?w=800',
    },
    {
      name: 'Santorini',
      country: 'Greece',
      countryCode: 'GR',
      region: 'South Aegean',
      latitude: 36.3932,
      longitude: 25.4615,
      popularity: 90,
      costIndex: 70,
      description: 'Stunning island with white buildings and breathtaking sunsets.',
      imageUrl: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800',
    },
    // Thailand
    {
      name: 'Bangkok',
      country: 'Thailand',
      countryCode: 'TH',
      region: 'Bangkok',
      latitude: 13.7563,
      longitude: 100.5018,
      popularity: 88,
      costIndex: 55,
      description: 'Vibrant capital with temples, street food, and bustling markets.',
      imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
    },
    {
      name: 'Phuket',
      country: 'Thailand',
      countryCode: 'TH',
      region: 'Phuket',
      latitude: 7.8804,
      longitude: 98.3923,
      popularity: 85,
      costIndex: 58,
      description: 'Tropical paradise with stunning beaches and crystal-clear waters.',
      imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
    },
    // Australia
    {
      name: 'Sydney',
      country: 'Australia',
      countryCode: 'AU',
      region: 'New South Wales',
      latitude: -33.8688,
      longitude: 151.2093,
      popularity: 91,
      costIndex: 82,
      description: 'Iconic harbor city with Opera House and beautiful beaches.',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    },
    {
      name: 'Melbourne',
      country: 'Australia',
      countryCode: 'AU',
      region: 'Victoria',
      latitude: -37.8136,
      longitude: 144.9631,
      popularity: 84,
      costIndex: 78,
      description: 'Cultural capital with coffee culture, art, and sports.',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    },
    // Canada
    {
      name: 'Toronto',
      country: 'Canada',
      countryCode: 'CA',
      region: 'Ontario',
      latitude: 43.6532,
      longitude: -79.3832,
      popularity: 83,
      costIndex: 75,
      description: 'Multicultural metropolis with CN Tower and diverse neighborhoods.',
      imageUrl: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800',
    },
    {
      name: 'Vancouver',
      country: 'Canada',
      countryCode: 'CA',
      region: 'British Columbia',
      latitude: 49.2827,
      longitude: -123.1207,
      popularity: 86,
      costIndex: 80,
      description: 'Coastal city with mountains, parks, and vibrant food scene.',
      imageUrl: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=800',
    },
    // Brazil
    {
      name: 'Rio de Janeiro',
      country: 'Brazil',
      countryCode: 'BR',
      region: 'Rio de Janeiro',
      latitude: -22.9068,
      longitude: -43.1729,
      popularity: 89,
      costIndex: 65,
      description: 'Vibrant city with Copacabana, Christ the Redeemer, and samba.',
      imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
    },
    {
      name: 'São Paulo',
      country: 'Brazil',
      countryCode: 'BR',
      region: 'São Paulo',
      latitude: -23.5505,
      longitude: -46.6333,
      popularity: 82,
      costIndex: 62,
      description: 'Largest city in South America with diverse culture and cuisine.',
      imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    },
    // United Arab Emirates
    {
      name: 'Dubai',
      country: 'United Arab Emirates',
      countryCode: 'AE',
      region: 'Dubai',
      latitude: 25.2048,
      longitude: 55.2708,
      popularity: 92,
      costIndex: 85,
      description: 'Ultra-modern city with luxury shopping, skyscrapers, and beaches.',
      imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
    },
    // India
    {
      name: 'Mumbai',
      country: 'India',
      countryCode: 'IN',
      region: 'Maharashtra',
      latitude: 19.0760,
      longitude: 72.8777,
      popularity: 85,
      costIndex: 50,
      description: 'Bollywood capital with vibrant markets and colonial architecture.',
      imageUrl: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800',
    },
    {
      name: 'Delhi',
      country: 'India',
      countryCode: 'IN',
      region: 'Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
      popularity: 83,
      costIndex: 48,
      description: 'Historic capital with Mughal monuments and diverse culture.',
      imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
    },
    // China
    {
      name: 'Beijing',
      country: 'China',
      countryCode: 'CN',
      region: 'Beijing',
      latitude: 39.9042,
      longitude: 116.4074,
      popularity: 88,
      costIndex: 65,
      description: 'Ancient capital with Forbidden City and Great Wall nearby.',
      imageUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800',
    },
    {
      name: 'Shanghai',
      country: 'China',
      countryCode: 'CN',
      region: 'Shanghai',
      latitude: 31.2304,
      longitude: 121.4737,
      popularity: 87,
      costIndex: 70,
      description: 'Modern metropolis with futuristic skyline and rich history.',
      imageUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800',
    },
    // Portugal
    {
      name: 'Lisbon',
      country: 'Portugal',
      countryCode: 'PT',
      region: 'Lisbon',
      latitude: 38.7223,
      longitude: -9.1393,
      popularity: 86,
      costIndex: 62,
      description: 'Hilly capital with colorful tiles, historic trams, and stunning views.',
      imageUrl: 'https://images.unsplash.com/photo-1555881403-671f5857c63b?w=800',
    },
    {
      name: 'Porto',
      country: 'Portugal',
      countryCode: 'PT',
      region: 'Porto',
      latitude: 41.1579,
      longitude: -8.6291,
      popularity: 79,
      costIndex: 58,
      description: 'Historic port city famous for wine and colorful riverside buildings.',
      imageUrl: 'https://images.unsplash.com/photo-1555881403-671f5857c63b?w=800',
    },
    // Indonesia
    {
      name: 'Bali',
      country: 'Indonesia',
      countryCode: 'ID',
      region: 'Bali',
      latitude: -8.3405,
      longitude: 115.0920,
      popularity: 93,
      costIndex: 45,
      description: 'Tropical paradise with temples, rice terraces, and beautiful beaches.',
      imageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800',
    },
    {
      name: 'Jakarta',
      country: 'Indonesia',
      countryCode: 'ID',
      region: 'Jakarta',
      latitude: -6.2088,
      longitude: 106.8456,
      popularity: 75,
      costIndex: 40,
      description: 'Bustling capital with diverse culture and modern skyscrapers.',
      imageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800',
    },
    // Turkey
    {
      name: 'Istanbul',
      country: 'Turkey',
      countryCode: 'TR',
      region: 'Istanbul',
      latitude: 41.0082,
      longitude: 28.9784,
      popularity: 89,
      costIndex: 60,
      description: 'City spanning two continents with rich history and stunning architecture.',
      imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7203?w=800',
    },
    {
      name: 'Cappadocia',
      country: 'Turkey',
      countryCode: 'TR',
      region: 'Cappadocia',
      latitude: 38.6431,
      longitude: 34.8331,
      popularity: 84,
      costIndex: 55,
      description: 'Unique landscape with fairy chimneys and hot air balloon rides.',
      imageUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800',
    },
    // Morocco
    {
      name: 'Marrakech',
      country: 'Morocco',
      countryCode: 'MA',
      region: 'Marrakech-Safi',
      latitude: 31.6295,
      longitude: -7.9811,
      popularity: 82,
      costIndex: 50,
      description: 'Vibrant city with souks, palaces, and the famous Jemaa el-Fnaa square.',
      imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800',
    },
    {
      name: 'Casablanca',
      country: 'Morocco',
      countryCode: 'MA',
      region: 'Casablanca-Settat',
      latitude: 33.5731,
      longitude: -7.5898,
      popularity: 76,
      costIndex: 52,
      description: 'Modern coastal city with Art Deco architecture and Hassan II Mosque.',
      imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800',
    },
    // South Africa
    {
      name: 'Cape Town',
      country: 'South Africa',
      countryCode: 'ZA',
      region: 'Western Cape',
      latitude: -33.9249,
      longitude: 18.4241,
      popularity: 88,
      costIndex: 55,
      description: 'Stunning coastal city with Table Mountain and beautiful beaches.',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    },
    // Egypt
    {
      name: 'Cairo',
      country: 'Egypt',
      countryCode: 'EG',
      region: 'Cairo',
      latitude: 30.0444,
      longitude: 31.2357,
      popularity: 85,
      costIndex: 45,
      description: 'Ancient capital with pyramids, Sphinx, and rich Pharaonic history.',
      imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800',
    },
    // Singapore
    {
      name: 'Singapore',
      country: 'Singapore',
      countryCode: 'SG',
      region: 'Singapore',
      latitude: 1.3521,
      longitude: 103.8198,
      popularity: 90,
      costIndex: 85,
      description: 'Modern city-state with gardens, skyscrapers, and diverse cuisine.',
      imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800',
    },
    // Malaysia
    {
      name: 'Kuala Lumpur',
      country: 'Malaysia',
      countryCode: 'MY',
      region: 'Kuala Lumpur',
      latitude: 3.1390,
      longitude: 101.6869,
      popularity: 81,
      costIndex: 50,
      description: 'Modern capital with Petronas Towers and diverse cultural heritage.',
      imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800',
    },
    // Vietnam
    {
      name: 'Ho Chi Minh City',
      country: 'Vietnam',
      countryCode: 'VN',
      region: 'Ho Chi Minh',
      latitude: 10.8231,
      longitude: 106.6297,
      popularity: 80,
      costIndex: 40,
      description: 'Vibrant city with French colonial architecture and street food.',
      imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
    },
    {
      name: 'Hanoi',
      country: 'Vietnam',
      countryCode: 'VN',
      region: 'Hanoi',
      latitude: 21.0285,
      longitude: 105.8542,
      popularity: 78,
      costIndex: 38,
      description: 'Historic capital with Old Quarter and rich Vietnamese culture.',
      imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
    },
    // South Korea
    {
      name: 'Seoul',
      country: 'South Korea',
      countryCode: 'KR',
      region: 'Seoul',
      latitude: 37.5665,
      longitude: 126.9780,
      popularity: 87,
      costIndex: 70,
      description: 'Modern capital with K-pop culture, palaces, and tech innovation.',
      imageUrl: 'https://images.unsplash.com/photo-1578645510449-e8b1c896bb56?w=800',
    },
    // Mexico
    {
      name: 'Mexico City',
      country: 'Mexico',
      countryCode: 'MX',
      region: 'Mexico City',
      latitude: 19.4326,
      longitude: -99.1332,
      popularity: 84,
      costIndex: 55,
      description: 'Vibrant capital with Aztec history, colorful markets, and cuisine.',
      imageUrl: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800',
    },
    {
      name: 'Cancún',
      country: 'Mexico',
      countryCode: 'MX',
      region: 'Quintana Roo',
      latitude: 21.1619,
      longitude: -86.8515,
      popularity: 86,
      costIndex: 65,
      description: 'Tropical resort city with white sand beaches and Mayan ruins.',
      imageUrl: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800',
    },
    // Argentina
    {
      name: 'Buenos Aires',
      country: 'Argentina',
      countryCode: 'AR',
      region: 'Buenos Aires',
      latitude: -34.6037,
      longitude: -58.3816,
      popularity: 83,
      costIndex: 58,
      description: 'Paris of South America with tango, steak, and European architecture.',
      imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
    },
    // Chile
    {
      name: 'Santiago',
      country: 'Chile',
      countryCode: 'CL',
      region: 'Santiago',
      latitude: -33.4489,
      longitude: -70.6693,
      popularity: 77,
      costIndex: 60,
      description: 'Capital city with Andean backdrop, wine, and modern culture.',
      imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
    },
    // Peru
    {
      name: 'Lima',
      country: 'Peru',
      countryCode: 'PE',
      region: 'Lima',
      latitude: -12.0464,
      longitude: -77.0428,
      popularity: 79,
      costIndex: 50,
      description: 'Coastal capital with colonial architecture and world-class cuisine.',
      imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
    },
    {
      name: 'Cusco',
      country: 'Peru',
      countryCode: 'PE',
      region: 'Cusco',
      latitude: -13.5319,
      longitude: -71.9675,
      popularity: 81,
      costIndex: 45,
      description: 'Gateway to Machu Picchu with Incan history and Andean culture.',
      imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
    },
    // Iceland
    {
      name: 'Reykjavik',
      country: 'Iceland',
      countryCode: 'IS',
      region: 'Capital Region',
      latitude: 64.1466,
      longitude: -21.9426,
      popularity: 82,
      costIndex: 90,
      description: 'Northernmost capital with Northern Lights and geothermal pools.',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    },
    // Norway
    {
      name: 'Oslo',
      country: 'Norway',
      countryCode: 'NO',
      region: 'Oslo',
      latitude: 59.9139,
      longitude: 10.7522,
      popularity: 78,
      costIndex: 88,
      description: 'Scandinavian capital with fjords, museums, and modern design.',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    },
    // Sweden
    {
      name: 'Stockholm',
      country: 'Sweden',
      countryCode: 'SE',
      region: 'Stockholm',
      latitude: 59.3293,
      longitude: 18.0686,
      popularity: 81,
      costIndex: 85,
      description: 'Archipelago city with beautiful old town and modern innovation.',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    },
    // Denmark
    {
      name: 'Copenhagen',
      country: 'Denmark',
      countryCode: 'DK',
      region: 'Capital Region',
      latitude: 55.6761,
      longitude: 12.5683,
      popularity: 83,
      costIndex: 82,
      description: 'Hygge capital with colorful buildings and cycling culture.',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    },
    // Czech Republic
    {
      name: 'Prague',
      country: 'Czech Republic',
      countryCode: 'CZ',
      region: 'Prague',
      latitude: 50.0755,
      longitude: 14.4378,
      popularity: 87,
      costIndex: 60,
      description: 'Medieval city with stunning architecture and rich history.',
      imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800',
    },
    // Austria
    {
      name: 'Vienna',
      country: 'Austria',
      countryCode: 'AT',
      region: 'Vienna',
      latitude: 48.2082,
      longitude: 16.3738,
      popularity: 85,
      costIndex: 72,
      description: 'Imperial capital with classical music, coffee culture, and palaces.',
      imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800',
    },
    // Switzerland
    {
      name: 'Zurich',
      country: 'Switzerland',
      countryCode: 'CH',
      region: 'Zurich',
      latitude: 47.3769,
      longitude: 8.5417,
      popularity: 80,
      costIndex: 95,
      description: 'Financial hub with pristine lake, mountains, and luxury shopping.',
      imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800',
    },
    {
      name: 'Geneva',
      country: 'Switzerland',
      countryCode: 'CH',
      region: 'Geneva',
      latitude: 46.2044,
      longitude: 6.1432,
      popularity: 78,
      costIndex: 92,
      description: 'International city with Lake Geneva and diplomatic institutions.',
      imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800',
    },
  ]

  const createdCities = []
  for (const cityData of cities) {
    const city = await prisma.city.upsert({
      where: { name_country: { name: cityData.name, country: cityData.country } },
      update: {},
      create: cityData,
    })
    createdCities.push(city)
  }

  // Create activities for major cities
  const paris = createdCities.find(c => c.name === 'Paris')
  if (paris) {
    const parisActivities = [
      {
        name: 'Eiffel Tower',
        description: 'Iconic iron lattice tower, symbol of Paris',
        category: 'SIGHTSEEING',
        cost: 25,
        duration: 120,
        cityId: paris.id,
        rating: 4.6,
        address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris',
        latitude: 48.8584,
        longitude: 2.2945,
        imageUrl: 'https://images.unsplash.com/photo-1511739001646-5b0c76349eab?w=800',
      },
      {
        name: 'Louvre Museum',
        description: 'World\'s largest art museum and historic monument',
        category: 'CULTURE',
        cost: 17,
        duration: 180,
        cityId: paris.id,
        rating: 4.7,
        address: 'Rue de Rivoli, 75001 Paris',
        latitude: 48.8606,
        longitude: 2.3376,
        imageUrl: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800',
      },
      {
        name: 'Seine River Cruise',
        description: 'Scenic boat tour along the Seine River',
        category: 'SIGHTSEEING',
        cost: 15,
        duration: 60,
        cityId: paris.id,
        rating: 4.5,
        imageUrl: 'https://images.unsplash.com/photo-1502602898737-2c1b0c15f5a1?w=800',
      },
      {
        name: 'French Bistro Dinner',
        description: 'Traditional French cuisine experience',
        category: 'FOOD',
        cost: 45,
        duration: 90,
        cityId: paris.id,
        rating: 4.4,
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      },
    ]

    for (const activity of parisActivities) {
      await prisma.activity.create({
        data: activity,
      })
    }
  }

  // Create activities for Tokyo
  const tokyo = createdCities.find(c => c.name === 'Tokyo')
  if (tokyo) {
    const tokyoActivities = [
      {
        name: 'Shibuya Crossing',
        description: 'World\'s busiest pedestrian crossing',
        category: 'SIGHTSEEING',
        cost: 0,
        duration: 30,
        cityId: tokyo.id,
        rating: 4.5,
        address: 'Shibuya City, Tokyo',
        latitude: 35.6598,
        longitude: 139.7006,
        imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
      },
      {
        name: 'Sushi Omakase',
        description: 'Premium sushi tasting experience',
        category: 'FOOD',
        cost: 120,
        duration: 120,
        cityId: tokyo.id,
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
      },
      {
        name: 'Tokyo Skytree',
        description: 'Tallest tower in Japan with panoramic views',
        category: 'SIGHTSEEING',
        cost: 18,
        duration: 90,
        cityId: tokyo.id,
        rating: 4.6,
        address: '1 Chome-1-2 Oshiage, Sumida City, Tokyo',
        latitude: 35.7101,
        longitude: 139.8107,
        imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
      },
    ]

    for (const activity of tokyoActivities) {
      await prisma.activity.create({
        data: activity,
      })
    }
  }

  // Create a sample trip for test user
  const startDate = new Date()
  startDate.setDate(startDate.getDate() + 30)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 7)

  // Delete existing sample trip if any
  await prisma.trip.deleteMany({
    where: { name: 'European Adventure', userId: testUser.id },
  })

  const sampleTrip = await prisma.trip.create({
    data: {
      name: 'European Adventure',
      description: 'A week-long journey through beautiful European cities',
      startDate,
      endDate,
      budget: 2500,
      userId: testUser.id,
      visibility: 'PRIVATE',
    },
  })

  // Add stops to the trip
  if (paris && tokyo) {
    const london = createdCities.find(c => c.name === 'London')
    if (london) {
      // Delete existing stops if any
      await prisma.tripStop.deleteMany({
        where: { tripId: sampleTrip.id },
      })

      await prisma.tripStop.create({
        data: {
          tripId: sampleTrip.id,
          cityId: paris.id,
          order: 1,
          arrivalDate: new Date(startDate),
          departureDate: new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000),
        },
      })

      await prisma.tripStop.create({
        data: {
          tripId: sampleTrip.id,
          cityId: london.id,
          order: 2,
          arrivalDate: new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000),
          departureDate: new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000),
        },
      })
    }
  }

  console.log('✅ Database seeded successfully!')
  console.log(`👤 Admin: admin@globetrotter.com / admin123`)
  console.log(`👤 User: user@globetrotter.com / admin123`)
  console.log(`🌍 Created ${createdCities.length} cities`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
