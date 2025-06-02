# Data Structure Plan

## Core TypeScript Interfaces

### Primary Data Interface
```typescript
interface LocalItem {
  id: string;
  name: string;
  type: 'Restaurant' | 'Cafe' | 'Park' | 'Event' | 'Shop' | 'Service';
  details: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  rating?: number; // 1-5 scale
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  hours?: {
    [key: string]: string; // e.g., "monday": "9:00 AM - 10:00 PM"
  };
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### API Response Interfaces
```typescript
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
  total?: number;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Filter and Search Interfaces
```typescript
interface FilterOptions {
  type?: string[];
  searchQuery?: string;
  minRating?: number;
  priceRange?: string[];
  tags?: string[];
  isActive?: boolean;
  city?: string;
}

interface SortOptions {
  field: 'name' | 'rating' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

interface SearchParams extends FilterOptions {
  page?: number;
  limit?: number;
  sort?: SortOptions;
}
```

## Enhanced Data Structure

### Sample Enhanced data.json
```json
[
  {
    "id": "rest_001",
    "name": "Joe's Pizza Palace",
    "type": "Restaurant",
    "details": "Authentic New York style pizza with fresh ingredients. Family-owned since 1985.",
    "location": {
      "address": "123 Main Street",
      "city": "Springfield",
      "state": "IL",
      "zipCode": "62701",
      "coordinates": {
        "lat": 39.7817,
        "lng": -89.6501
      }
    },
    "contact": {
      "phone": "(555) 123-4567",
      "email": "info@joespizza.com",
      "website": "https://joespizza.com"
    },
    "rating": 4.5,
    "priceRange": "$$",
    "hours": {
      "monday": "11:00 AM - 10:00 PM",
      "tuesday": "11:00 AM - 10:00 PM",
      "wednesday": "11:00 AM - 10:00 PM",
      "thursday": "11:00 AM - 11:00 PM",
      "friday": "11:00 AM - 12:00 AM",
      "saturday": "12:00 PM - 12:00 AM",
      "sunday": "12:00 PM - 9:00 PM"
    },
    "tags": ["italian", "pizza", "family-friendly", "takeout", "delivery"],
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-12-01T14:22:00Z"
  },
  {
    "id": "cafe_001",
    "name": "Green Leaf Cafe",
    "type": "Cafe",
    "details": "Cozy coffee shop with organic beans, fresh pastries, and free WiFi. Perfect for remote work.",
    "location": {
      "address": "456 Oak Avenue",
      "city": "Springfield",
      "state": "IL",
      "zipCode": "62702",
      "coordinates": {
        "lat": 39.7851,
        "lng": -89.6440
      }
    },
    "contact": {
      "phone": "(555) 987-6543",
      "website": "https://greenleafcafe.com"
    },
    "rating": 4.2,
    "priceRange": "$",
    "hours": {
      "monday": "6:00 AM - 8:00 PM",
      "tuesday": "6:00 AM - 8:00 PM",
      "wednesday": "6:00 AM - 8:00 PM",
      "thursday": "6:00 AM - 8:00 PM",
      "friday": "6:00 AM - 9:00 PM",
      "saturday": "7:00 AM - 9:00 PM",
      "sunday": "7:00 AM - 7:00 PM"
    },
    "tags": ["coffee", "organic", "wifi", "pastries", "vegan-options"],
    "isActive": true,
    "createdAt": "2024-02-01T09:15:00Z",
    "updatedAt": "2024-11-15T11:45:00Z"
  },
  {
    "id": "park_001",
    "name": "Riverside Park",
    "type": "Park",
    "details": "Beautiful 50-acre park with walking trails, playground, and picnic areas along the river.",
    "location": {
      "address": "789 River Road",
      "city": "Springfield",
      "state": "IL",
      "zipCode": "62703",
      "coordinates": {
        "lat": 39.7901,
        "lng": -89.6234
      }
    },
    "contact": {
      "phone": "(555) 555-0123",
      "website": "https://springfieldparks.gov/riverside"
    },
    "rating": 4.8,
    "hours": {
      "monday": "6:00 AM - 10:00 PM",
      "tuesday": "6:00 AM - 10:00 PM",
      "wednesday": "6:00 AM - 10:00 PM",
      "thursday": "6:00 AM - 10:00 PM",
      "friday": "6:00 AM - 10:00 PM",
      "saturday": "6:00 AM - 10:00 PM",
      "sunday": "6:00 AM - 10:00 PM"
    },
    "tags": ["outdoor", "family-friendly", "trails", "playground", "free"],
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-10-01T12:00:00Z"
  }
]
```

## Data Validation Schema

### Runtime Validation
```typescript
import { z } from 'zod';

export const LocalItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  type: z.enum(['Restaurant', 'Cafe', 'Park', 'Event', 'Shop', 'Service']),
  details: z.string().min(10).max(500),
  location: z.object({
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().length(2),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180)
    }).optional()
  }),
  contact: z.object({
    phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/).optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional()
  }).optional(),
  rating: z.number().min(1).max(5).optional(),
  priceRange: z.enum(['$', '$$', '$$$', '$$$$']).optional(),
  hours: z.record(z.string()).optional(),
  tags: z.array(z.string()),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type LocalItem = z.infer<typeof LocalItemSchema>;
```

## Data Management Strategy

### File Structure
```
server/
├── data/
│   ├── restaurants.json
│   ├── cafes.json
│   ├── parks.json
│   ├── events.json
│   └── index.json (master list)
├── types/
│   ├── LocalItem.ts
│   ├── ApiResponse.ts
│   └── FilterOptions.ts
└── services/
    ├── DataService.ts
    └── ValidationService.ts
```

### Data Service Implementation
```typescript
class DataService {
  private static data: LocalItem[] = [];
  
  static async loadData(): Promise<void> {
    // Load and validate data from JSON files
  }
  
  static getAll(filters?: FilterOptions): LocalItem[] {
    // Apply filters and return data
  }
  
  static getById(id: string): LocalItem | null {
    // Return single item by ID
  }
  
  static search(query: string): LocalItem[] {
    // Search across name, details, and tags
  }
  
  static getByType(type: string): LocalItem[] {
    // Filter by business type
  }
}
```

## Future Data Enhancements

### Phase 2 Data Features
- User-generated reviews and ratings
- Photo attachments
- Business owner verification
- Real-time availability status
- Social media integration

### Database Migration Plan
- SQLite for development
- PostgreSQL for production
- Prisma ORM for type-safe database queries
- Data migration scripts

### Caching Strategy
- In-memory caching for frequently accessed data
- Redis for distributed caching
- Cache invalidation on data updates

## Data Quality Standards

### Validation Rules
- All required fields must be present
- Phone numbers must follow (555) 123-4567 format
- Email addresses must be valid
- URLs must be accessible
- Coordinates must be valid lat/lng pairs
- Tags must be lowercase and hyphenated

### Data Integrity Checks
- Duplicate detection by name and address
- Business hours validation
- Rating range validation (1-5)
- Active status verification

### Error Handling
- Malformed data logging
- Graceful degradation for missing optional fields
- Client notification for data inconsistencies