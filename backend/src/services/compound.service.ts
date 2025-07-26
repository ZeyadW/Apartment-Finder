import { ICompound } from '../models/Compound';
import { ICompoundRepository } from '../repositories/compound.repository';

export interface ICompoundService {
  getAllCompounds(): Promise<ICompound[]>;
  getCompoundById(id: string): Promise<ICompound | null>;
  createCompound(compoundData: Partial<ICompound>): Promise<ICompound>;
  updateCompound(id: string, compoundData: Partial<ICompound>): Promise<ICompound | null>;
  deleteCompound(id: string): Promise<boolean>;
  getCompoundByName(name: string): Promise<ICompound | null>;
}

export class CompoundService implements ICompoundService {
  constructor(private compoundRepository: ICompoundRepository) {}

  async getAllCompounds(): Promise<ICompound[]> {
    return await this.compoundRepository.findAll();
  }

  async getCompoundById(id: string): Promise<ICompound | null> {
    return await this.compoundRepository.findById(id);
  }

  async createCompound(compoundData: Partial<ICompound>): Promise<ICompound> {
    // Check if compound with same name already exists
    if (compoundData.name) {
      const existingCompound = await this.compoundRepository.findByName(compoundData.name);
      if (existingCompound) {
        throw new Error('Compound with this name already exists');
      }
    }

    return await this.compoundRepository.create(compoundData);
  }

  async updateCompound(id: string, compoundData: Partial<ICompound>): Promise<ICompound | null> {
    // Check if compound exists
    const existingCompound = await this.compoundRepository.findById(id);
    if (!existingCompound) {
      throw new Error('Compound not found');
    }

    // Check if name is being updated and if it conflicts with another compound
    if (compoundData.name && compoundData.name !== existingCompound.name) {
      const compoundWithSameName = await this.compoundRepository.findByName(compoundData.name);
      if (compoundWithSameName) {
        throw new Error('Compound with this name already exists');
      }
    }

    return await this.compoundRepository.update(id, compoundData);
  }

  async deleteCompound(id: string): Promise<boolean> {
    // Check if compound exists
    const existingCompound = await this.compoundRepository.findById(id);
    if (!existingCompound) {
      throw new Error('Compound not found');
    }

    return await this.compoundRepository.delete(id);
  }

  async getCompoundByName(name: string): Promise<ICompound | null> {
    return await this.compoundRepository.findByName(name);
  }
} 