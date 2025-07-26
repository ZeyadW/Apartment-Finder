import Amenity from "../models/Amenity";

export const seedAmenities = async () => {
  const amenities = [
    "Pool", "Gym", "Parking", "Balcony", "Elevator", "Security", 
    "Air Conditioning", "Heating", "Dishwasher", "Washing Machine",
    "Dryer", "Furnished", "Pet Friendly", "Garden", "Terrace",
    "Storage", "Bike Storage", "Concierge", "Doorman", "Rooftop",
    "Clubhouse", "Schools", "Business Hub", "Sports Clubs", "Mosque"
  ];

  for (const name of amenities) {
    await Amenity.updateOne(
      { name },
      { $setOnInsert: { name } },
      { upsert: true }
    );
  }
  console.log("Amenities seeded");
}; 