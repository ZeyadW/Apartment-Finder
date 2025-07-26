import { IDeveloper } from '../models/Developer';
import { IDeveloperRepository } from '../repositories/developer.repository';

export interface IDeveloperService {
  getAllDevelopers(): Promise<IDeveloper[]>;
  getDeveloperById(id: string): Promise<IDeveloper | null>;
  createDeveloper(developerData: Partial<IDeveloper>): Promise<IDeveloper>;
  updateDeveloper(id: string, developerData: Partial<IDeveloper>): Promise<IDeveloper | null>;
  deleteDeveloper(id: string): Promise<boolean>;
  getDeveloperByName(name: string): Promise<IDeveloper | null>;
}

export class DeveloperService implements IDeveloperService {
  constructor(private developerRepository: IDeveloperRepository) {}

  async getAllDevelopers(): Promise<IDeveloper[]> {
    return await this.developerRepository.findAll();
  }

  async getDeveloperById(id: string): Promise<IDeveloper | null> {
    return await this.developerRepository.findById(id);
  }

  async createDeveloper(developerData: Partial<IDeveloper>): Promise<IDeveloper> {
    // Check if developer with same name already exists
    if (developerData.name) {
      const existingDeveloper = await this.developerRepository.findByName(developerData.name);
      if (existingDeveloper) {
        throw new Error('Developer with this name already exists');
      }
    }

    return await this.developerRepository.create(developerData);
  }

  async updateDeveloper(id: string, developerData: Partial<IDeveloper>): Promise<IDeveloper | null> {
    // Check if developer exists
    const existingDeveloper = await this.developerRepository.findById(id);
    if (!existingDeveloper) {
      throw new Error('Developer not found');
    }

    // Check if name is being updated and if it conflicts with another developer
    if (developerData.name && developerData.name !== existingDeveloper.name) {
      const developerWithSameName = await this.developerRepository.findByName(developerData.name);
      if (developerWithSameName) {
        throw new Error('Developer with this name already exists');
      }
    }

    return await this.developerRepository.update(id, developerData);
  }

  async deleteDeveloper(id: string): Promise<boolean> {
    // Check if developer exists
    const existingDeveloper = await this.developerRepository.findById(id);
    if (!existingDeveloper) {
      throw new Error('Developer not found');
    }

    return await this.developerRepository.delete(id);
  }

  async getDeveloperByName(name: string): Promise<IDeveloper | null> {
    return await this.developerRepository.findByName(name);
  }
} 