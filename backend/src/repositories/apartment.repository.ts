import { IApartment } from '../models/Apartment';
import Apartment from '../models/Apartment';
import { QueryApartmentsDto } from '../dtos/query-apartments.dto';

export interface IApartmentRepository {
  findAll(queryDto: QueryApartmentsDto): Promise<IApartment[]>;
  findById(id: string): Promise<IApartment | null>;
  create(apartmentData: Partial<IApartment>): Promise<IApartment>;
  update(id: string, apartmentData: Partial<IApartment>): Promise<IApartment | null>;
  delete(id: string): Promise<boolean>;
  findByAgent(agentId: string): Promise<IApartment[]>;
  findByCompound(compoundId: string): Promise<IApartment[]>;
  findByDeveloper(developerId: string): Promise<IApartment[]>;
  findFavoritesByUser(userId: string): Promise<IApartment[]>;
  addToFavorites(apartmentId: string, userId: string): Promise<IApartment | null>;
  removeFromFavorites(apartmentId: string, userId: string): Promise<IApartment | null>;
  toggleAvailability(id: string): Promise<IApartment | null>;
}

export class ApartmentRepository implements IApartmentRepository {
  async findAll(queryDto: QueryApartmentsDto): Promise<IApartment[]> {
    try {
      const query: any = {};

      // Search functionality - only search by unitName, unitNumber, and project
      if (queryDto.search) {
        query.$or = [
          { unitName: { $regex: queryDto.search, $options: 'i' } },
          { unitNumber: { $regex: queryDto.search, $options: 'i' } },
          { project: { $regex: queryDto.search, $options: 'i' } }
        ];
      }

    // Price filter
    if (queryDto.minPrice || queryDto.maxPrice) {
      query.price = {};
      if (queryDto.minPrice) query.price.$gte = queryDto.minPrice;
      if (queryDto.maxPrice) query.price.$lte = queryDto.maxPrice;
    }

    // Bedrooms filter
    if (queryDto.bedrooms !== undefined) {
      query.bedrooms = queryDto.bedrooms;
    }

    // Bathrooms filter
    if (queryDto.bathrooms !== undefined) {
      query.bathrooms = queryDto.bathrooms;
    }

    // City filter
    if (queryDto.city) {
      query.city = { $regex: queryDto.city, $options: "i" };
    }

    // Listing type filter
    if (queryDto.listingType) {
      query.listingType = queryDto.listingType;
    }

    // State filter
    if (queryDto.state) {
      query.state = { $regex: queryDto.state, $options: "i" };
    }

    // Availability filter
    if (queryDto.isAvailable !== undefined) {
      query.isAvailable = queryDto.isAvailable;
    }

    // Square feet filter
    if (queryDto.minSquareFeet || queryDto.maxSquareFeet) {
      query.squareFeet = {};
      if (queryDto.minSquareFeet) query.squareFeet.$gte = queryDto.minSquareFeet;
      if (queryDto.maxSquareFeet) query.squareFeet.$lte = queryDto.maxSquareFeet;
    }

    // Compound name filter (populate and filter)
    if (queryDto.compoundName) {
      // This will be handled in the service layer with populate
    }

    // Developer name filter (populate and filter)
    if (queryDto.developerName) {
      // This will be handled in the service layer with populate
    }

      return await Apartment.find(query)
        .populate('agent', 'firstName lastName email')
        .populate('developer', 'name')
        .populate('compound', 'name')
        .populate('amenities', 'name')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new Error('Failed to fetch apartments');
    }
  }

  async findById(id: string): Promise<IApartment | null> {
    try {
      return await Apartment.findById(id)
        .populate('agent', 'firstName lastName email')
        .populate('developer', 'name')
        .populate('compound', 'name')
        .populate('amenities', 'name');
    } catch (error) {
      console.error('Error in findById:', error);
      throw new Error('Failed to fetch apartment');
    }
  }

  async create(apartmentData: Partial<IApartment>): Promise<IApartment> {
    try {
      return await Apartment.create(apartmentData);
    } catch (error) {
      console.error('Error in create:', error);
      if (error instanceof Error && error.message.includes('validation failed')) {
        throw new Error('Invalid apartment data provided');
      }
      throw new Error('Failed to create apartment');
    }
  }

  async update(id: string, apartmentData: Partial<IApartment>): Promise<IApartment | null> {
    return await Apartment.findByIdAndUpdate(id, apartmentData, {
      new: true,
      runValidators: true
    }).populate('agent', 'firstName lastName email')
      .populate('developer', 'name')
      .populate('compound', 'name')
      .populate('amenities', 'name');
  }

  async delete(id: string): Promise<boolean> {
    const result = await Apartment.findByIdAndDelete(id);
    return result !== null;
  }

  async findByAgent(agentId: string): Promise<IApartment[]> {
    return await Apartment.find({ agent: agentId })
      .populate('agent', 'firstName lastName email')
      .populate('developer', 'name')
      .populate('compound', 'name')
      .populate('amenities', 'name')
      .sort({ createdAt: -1 });
  }

  async findByCompound(compoundId: string): Promise<IApartment[]> {
    return await Apartment.find({ 
      compound: compoundId,
      isAvailable: true // Only show available apartments in compound view
    })
      .populate('agent', 'firstName lastName email')
      .populate('developer', 'name')
      .populate('compound', 'name')
      .populate('amenities', 'name')
      .sort({ createdAt: -1 });
  }

  async findByDeveloper(developerId: string): Promise<IApartment[]> {
    return await Apartment.find({ 
      developer: developerId,
      isAvailable: true // Only show available apartments in developer view
    })
      .populate('agent', 'firstName lastName email')
      .populate('developer', 'name')
      .populate('compound', 'name')
      .populate('amenities', 'name')
      .sort({ createdAt: -1 });
  }

  async findFavoritesByUser(userId: string): Promise<IApartment[]> {
    return await Apartment.find({ 
      favorites: userId,
      isAvailable: true // Only show available apartments in favorites
    })
      .populate('agent', 'firstName lastName email')
      .populate('developer', 'name')
      .populate('compound', 'name')
      .populate('amenities', 'name')
      .sort({ createdAt: -1 });
  }

  async addToFavorites(apartmentId: string, userId: string): Promise<IApartment | null> {
    return await Apartment.findByIdAndUpdate(
      apartmentId,
      { $addToSet: { favorites: userId } },
      { new: true }
    ).populate('agent', 'firstName lastName email')
      .populate('developer', 'name')
      .populate('compound', 'name')
      .populate('amenities', 'name');
  }

  async removeFromFavorites(apartmentId: string, userId: string): Promise<IApartment | null> {
    return await Apartment.findByIdAndUpdate(
      apartmentId,
      { $pull: { favorites: userId } },
      { new: true }
    ).populate('agent', 'firstName lastName email')
      .populate('developer', 'name')
      .populate('compound', 'name')
      .populate('amenities', 'name');
  }

  async toggleAvailability(id: string): Promise<IApartment | null> {
    const apartment = await Apartment.findById(id);
    if (!apartment) return null;

    apartment.isAvailable = !apartment.isAvailable;
    await apartment.save();
    
    // Return populated apartment
    return await Apartment.findById(id)
      .populate('agent', 'firstName lastName email')
      .populate('developer', 'name')
      .populate('compound', 'name')
      .populate('amenities', 'name');
  }
} 