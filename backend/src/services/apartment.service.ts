import { IApartment } from '../models/Apartment';
import { QueryApartmentsDto } from '../dtos/query-apartments.dto';
import { IApartmentRepository } from '../repositories/apartment.repository';
import Compound from '../models/Compound';
import Developer from '../models/Developer';

export interface IApartmentService {
  getAllApartments(queryDto: QueryApartmentsDto): Promise<IApartment[]>;
  getAllApartmentsForAdmin(queryDto: QueryApartmentsDto): Promise<IApartment[]>;
  getApartmentById(id: string): Promise<IApartment | null>;
  createApartment(apartmentData: Partial<IApartment>): Promise<IApartment>;
  updateApartment(id: string, apartmentData: Partial<IApartment>): Promise<IApartment | null>;
  deleteApartment(id: string): Promise<boolean>;
  getMyListings(agentId: string): Promise<IApartment[]>;
  toggleAvailability(id: string): Promise<IApartment | null>;
  getFavorites(userId: string): Promise<IApartment[]>;
  addToFavorites(apartmentId: string, userId: string): Promise<IApartment | null>;
  removeFromFavorites(apartmentId: string, userId: string): Promise<IApartment | null>;
}

export class ApartmentService implements IApartmentService {
  constructor(private apartmentRepository: IApartmentRepository) {}

  async getAllApartments(queryDto: QueryApartmentsDto): Promise<IApartment[]> {
    // Always filter by available apartments unless explicitly requested otherwise
    const queryWithAvailability = {
      ...queryDto,
      isAvailable: queryDto.isAvailable !== undefined ? queryDto.isAvailable : true
    };
    
    let apartments = await this.apartmentRepository.findAll(queryWithAvailability);

    // Handle compound name filtering
    if (queryDto.compoundName) {
      const compounds = await Compound.find({
        name: { $regex: queryDto.compoundName, $options: "i" }
      });
      const compoundIds = compounds.map(c => c._id);
      apartments = apartments.filter(apartment => 
        compoundIds.includes(apartment.compound.toString())
      );
    }

    // Handle developer name filtering
    if (queryDto.developerName) {
      const developers = await Developer.find({
        name: { $regex: queryDto.developerName, $options: "i" }
      });
      const developerIds = developers.map(d => d._id);
      apartments = apartments.filter(apartment => 
        developerIds.includes(apartment.developer.toString())
      );
    }

    return apartments;
  }

  async getAllApartmentsForAdmin(queryDto: QueryApartmentsDto): Promise<IApartment[]> {
    // For admin, don't filter by availability - show all apartments
    let apartments = await this.apartmentRepository.findAll(queryDto);

    // Handle compound name filtering
    if (queryDto.compoundName) {
      const compounds = await Compound.find({
        name: { $regex: queryDto.compoundName, $options: "i" }
      });
      const compoundIds = compounds.map(c => c._id);
      apartments = apartments.filter(apartment => 
        compoundIds.includes(apartment.compound.toString())
      );
    }

    // Handle developer name filtering
    if (queryDto.developerName) {
      const developers = await Developer.find({
        name: { $regex: queryDto.developerName, $options: "i" }
      });
      const developerIds = developers.map(d => d._id);
      apartments = apartments.filter(apartment => 
        developerIds.includes(apartment.developer.toString())
      );
    }

    return apartments;
  }

  async getApartmentById(id: string): Promise<IApartment | null> {
    return await this.apartmentRepository.findById(id);
  }

  async createApartment(apartmentData: Partial<IApartment>): Promise<IApartment> {
    // Validate that compound and developer exist
    if (apartmentData.compound) {
      const compound = await Compound.findById(apartmentData.compound);
      if (!compound) {
        throw new Error('Compound not found');
      }
    }

    if (apartmentData.developer) {
      const developer = await Developer.findById(apartmentData.developer);
      if (!developer) {
        throw new Error('Developer not found');
      }
    }

    return await this.apartmentRepository.create(apartmentData);
  }

  async updateApartment(id: string, apartmentData: Partial<IApartment>): Promise<IApartment | null> {
    // Validate that compound and developer exist if they're being updated
    if (apartmentData.compound) {
      const compound = await Compound.findById(apartmentData.compound);
      if (!compound) {
        throw new Error('Compound not found');
      }
    }

    if (apartmentData.developer) {
      const developer = await Developer.findById(apartmentData.developer);
      if (!developer) {
        throw new Error('Developer not found');
      }
    }

    return await this.apartmentRepository.update(id, apartmentData);
  }

  async deleteApartment(id: string): Promise<boolean> {
    return await this.apartmentRepository.delete(id);
  }

  async getMyListings(agentId: string): Promise<IApartment[]> {
    return await this.apartmentRepository.findByAgent(agentId);
  }

  async toggleAvailability(id: string): Promise<IApartment | null> {
    return await this.apartmentRepository.toggleAvailability(id);
  }

  async getFavorites(userId: string): Promise<IApartment[]> {
    return await this.apartmentRepository.findFavoritesByUser(userId);
  }

  async addToFavorites(apartmentId: string, userId: string): Promise<IApartment | null> {
    // Check if apartment exists
    const apartment = await this.apartmentRepository.findById(apartmentId);
    if (!apartment) {
      throw new Error('Apartment not found');
    }

    return await this.apartmentRepository.addToFavorites(apartmentId, userId);
  }

  async removeFromFavorites(apartmentId: string, userId: string): Promise<IApartment | null> {
    // Check if apartment exists
    const apartment = await this.apartmentRepository.findById(apartmentId);
    if (!apartment) {
      throw new Error('Apartment not found');
    }

    return await this.apartmentRepository.removeFromFavorites(apartmentId, userId);
  }
} 