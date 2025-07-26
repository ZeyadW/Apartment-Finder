import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Apartment from './models/Apartment';
import User, { UserRole } from './models/User';
import Developer from './models/Developer';
import Compound from './models/Compound';
import { seedAmenities } from "./seeders/userSeeder";
import Amenity from "./models/Amenity";

dotenv.config();

// Sample developers
const sampleDevelopers = [
  {
    name: "Orascom Development Egypt",
    description: "Leading real estate developer in Egypt",
    website: "https://www.orascomdh.com"
  },
  {
    name: "Palm Hills Developments",
    description: "Premium real estate developer",
    website: "https://www.palmhillsdevelopments.com"
  },
  {
    name: "Talaat Moustafa Group",
    description: "Egypt's largest real estate developer",
    website: "https://www.tmg.eg"
  },
  {
    name: "Emaar Misr",
    description: "Subsidiary of Emaar Properties",
    website: "https://www.emaarmisr.com"
  }
];

// Sample compounds
const sampleCompounds = [
  {
    name: "O West Orascom",
    description: "Luxury compound in 6th of October City",
    location: "6th of October City, Giza"
  },
  {
    name: "Palm Hills Katameya",
    description: "Premium residential compound",
    location: "Katameya, Cairo"
  },
  {
    name: "Madinaty",
    description: "Integrated city development",
    location: "New Cairo, Cairo"
  },
  {
    name: "Marassi",
    description: "Beachfront resort community",
    location: "North Coast, Alexandria"
  }
];

// Sample apartments
const sampleApartments = [
  {
    unitName: "1 Bedroom Apartment",
    unitNumber: "A101",
    project: "O West Orascom",
    address: "O West, 6th of October City",
    city: "Giza",
    price: 8500,
    listingType: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 84,
    description: "A 1 bedroom Apartment in O West Orascom by Orascom Development Egypt. The Apartment size is 84 m2 with 1 bathrooms.",
    amenities: ["Clubhouse", "Schools", "Business Hub", "Sports Clubs", "Mosque", "Bike Storage"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"
    ],
    isAvailable: true
  },
  {
    unitName: "2 Bedroom Apartment",
    unitNumber: "B205",
    project: "Palm Hills Katameya",
    address: "Palm Hills, Katameya",
    city: "Cairo",
    price: 1200000,
    listingType: 'sale',
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 120,
    description: "Spacious 2 bedroom apartment with modern amenities and beautiful views.",
    amenities: ["Pool", "Gym", "Security", "Garden", "Parking", "Elevator"],
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"
    ],
    isAvailable: true
  },
  {
    unitName: "3 Bedroom Villa",
    unitNumber: "V301",
    project: "Madinaty",
    address: "Madinaty, New Cairo",
    city: "Cairo",
    price: 2500000,
    listingType: 'sale',
    bedrooms: 3,
    bathrooms: 3,
    squareFeet: 180,
    description: "Luxury 3 bedroom villa with private garden and modern amenities.",
    amenities: ["Garden", "Pool", "Gym", "Security", "Parking", "Balcony"],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"
    ],
    isAvailable: true
  },
  {
    unitName: "Studio Apartment",
    unitNumber: "S401",
    project: "Marassi",
    address: "Marassi, North Coast",
    city: "Alexandria",
    state: "Alexandria Governorate",
    zipCode: "21934",
    price: 6000,
    listingType: 'rent',
    bedrooms: 0,
    bathrooms: 1,
    squareFeet: 45,
    description: "Cozy studio apartment perfect for singles or couples.",
    amenities: ["Pool", "Security", "Parking"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"
    ],
    isAvailable: true
  },
  {
    unitName: "4 Bedroom Penthouse",
    unitNumber: "P501",
    project: "Talaat Moustafa Group",
    address: "Al Rehab, New Cairo",
    city: "Cairo",
    state: "Cairo Governorate",
    zipCode: "11828",
    price: 8500000,
    listingType: 'sale',
    bedrooms: 4,
    bathrooms: 4,
    squareFeet: 300,
    description: "Luxury penthouse with panoramic views and premium finishes.",
    amenities: ["Terrace", "Pool", "Gym", "Security", "Concierge"],
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"
    ],
    isAvailable: true
  },
  {
    unitName: "2 Bedroom Duplex",
    unitNumber: "D601",
    project: "O West Orascom",
    address: "O West, 6th of October City",
    city: "Giza",
    price: 12000,
    listingType: 'rent',
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 140,
    description: "Modern 2 bedroom duplex with open concept living area and private balcony.",
    amenities: ["Balcony", "Pool", "Gym", "Security", "Parking", "Garden"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"
    ],
    isAvailable: true
  },
  {
    unitName: "3 Bedroom Apartment",
    unitNumber: "A701",
    project: "Palm Hills Katameya",
    address: "Palm Hills, Katameya",
    city: "Cairo",
    price: 1800000,
    listingType: 'sale',
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 160,
    description: "Spacious 3 bedroom apartment with modern kitchen and large living room.",
    amenities: ["Pool", "Gym", "Security", "Parking"],
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"
    ],
    isAvailable: true
  },
  {
    unitName: "1 Bedroom Apartment",
    unitNumber: "B801",
    project: "Madinaty",
    address: "Madinaty, New Cairo",
    city: "Cairo",
    price: 9500,
    listingType: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 75,
    description: "Cozy 1 bedroom apartment with modern amenities and city views.",
    amenities: ["Pool", "Gym", "Security", "Parking", "Balcony"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"
    ],
    isAvailable: true
  },
  {
    unitName: "Luxury 5 Bedroom Villa",
    unitNumber: "V901",
    project: "Marassi",
    address: "Marassi, North Coast",
    city: "Alexandria",
    price: 15000,
    listingType: 'rent',
    bedrooms: 5,
    bathrooms: 5,
    squareFeet: 400,
    description: "Exclusive 5 bedroom luxury villa with private beach access and premium amenities.",
    amenities: ["Pool", "Gym", "Security", "Parking", "Garden", "Concierge"],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"
    ],
    isAvailable: true
  },
  {
    unitName: "2 Bedroom Townhouse",
    unitNumber: "T1001",
    project: "O West Orascom",
    address: "O West, 6th of October City",
    city: "Giza",
    price: 2200000,
    listingType: 'sale',
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 150,
    description: "Modern 2 bedroom townhouse with private garden and rooftop terrace.",
    amenities: ["Garden", "Terrace", "Pool", "Gym", "Security", "Parking"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"
    ],
    isAvailable: true
  },
  {
    unitName: "Studio Loft",
    unitNumber: "L1101",
    project: "Palm Hills Katameya",
    address: "Palm Hills, Katameya",
    city: "Cairo",
    price: 7000,
    listingType: 'rent',
    bedrooms: 0,
    bathrooms: 1,
    squareFeet: 55,
    description: "Modern studio loft with high ceilings and contemporary design.",
    amenities: ["Pool", "Gym", "Security", "Parking"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"
    ],
    isAvailable: true
  },
  {
    unitName: "4 Bedroom Family Villa",
    unitNumber: "V1201",
    project: "Madinaty",
    address: "Madinaty, New Cairo",
    city: "Cairo",
    price: 4500000,
    listingType: 'sale',
    bedrooms: 4,
    bathrooms: 4,
    squareFeet: 280,
    description: "Spacious family villa with large garden and multiple living areas.",
    amenities: ["Garden", "Pool", "Gym", "Security", "Parking", "Schools"],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"
    ],
    isAvailable: true
  }
];

// Sample users
const sampleUsers = [
  {
    firstName: "Admin",
    lastName: "User",
    email: "admin@apartmentapp.com",
    password: "admin123",
    role: UserRole.ADMIN,
    phone: "+201234567890",
    isActive: true,
  },
  {
    firstName: "Ahmed",
    lastName: "Hassan",
    email: "ahmed@apartmentapp.com",
    password: "agent123",
    role: UserRole.AGENT,
    phone: "+201234567891",
    isActive: true,
  },
  {
    firstName: "Fatima",
    lastName: "Ali",
    email: "fatima@apartmentapp.com",
    password: "agent456",
    role: UserRole.AGENT,
    phone: "+201234567892",
    isActive: true,
  },
  {
    firstName: "Omar",
    lastName: "Mohamed",
    email: "omar@apartmentapp.com",
    password: "user123",
    role: UserRole.USER,
    phone: "+201234567893",
    isActive: true,
  },
  {
    firstName: "Aisha",
    lastName: "Ahmed",
    email: "aisha@apartmentapp.com",
    password: "user456",
    role: UserRole.USER,
    phone: "+201234567894",
    isActive: true,
  }
];

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Apartment.deleteMany({});
    await User.deleteMany({});
    await Developer.deleteMany({});
    await Compound.deleteMany({});
    console.log('Cleared existing data');

    // Seed developers
    const createdDevelopers = await Developer.insertMany(sampleDevelopers);
    console.log(`Created ${createdDevelopers.length} developers`);

    // Seed compounds
    const createdCompounds = await Compound.insertMany(sampleCompounds);
    console.log(`Created ${createdCompounds.length} compounds`);

    // Seed users individually to ensure password hashing
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`Created ${createdUsers.length} users`);

    // Seed amenities
    await seedAmenities();
    const allAmenities = await Amenity.find();
    const amenityMap = new Map(allAmenities.map(a => [a.name, a._id]));

    // Get agent users for apartment assignments
    const agents = createdUsers.filter(user => user.role === UserRole.AGENT);
    const agentIds = agents.map(agent => agent._id);

    // Add references to apartments
    const apartmentsWithRefs = sampleApartments.map((apartment, index) => {
      const developerIndex = index % createdDevelopers.length;
      const compoundIndex = index % createdCompounds.length;
      const agentIndex = index % agentIds.length;
      // Map amenity names to ObjectIds
      const amenityIds = (apartment.amenities || []).map((name: string) => amenityMap.get(name)).filter(Boolean);
      return {
        ...apartment,
        developer: createdDevelopers[developerIndex]._id,
        compound: createdCompounds[compoundIndex]._id,
        agent: agentIds[agentIndex],
        amenities: amenityIds
      };
    });

    // Seed apartments
    await Apartment.insertMany(apartmentsWithRefs);
    console.log(`Created ${apartmentsWithRefs.length} apartments`);

    console.log('Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('Admin: admin@apartmentapp.com / admin123');
    console.log('Agent: ahmed@apartmentapp.com / agent123');
    console.log('User: omar@apartmentapp.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase; 