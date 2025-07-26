import { IDeveloper } from '../models/Developer';
import Developer from '../models/Developer';

export interface IDeveloperRepository {
  findAll(): Promise<IDeveloper[]>;
  findById(id: string): Promise<IDeveloper | null>;
  create(developerData: Partial<IDeveloper>): Promise<IDeveloper>;
  update(id: string, developerData: Partial<IDeveloper>): Promise<IDeveloper | null>;
  delete(id: string): Promise<boolean>;
  findByName(name: string): Promise<IDeveloper | null>;
}

export class DeveloperRepository implements IDeveloperRepository {
  async findAll(): Promise<IDeveloper[]> {
    return await Developer.find().sort({ name: 1 });
  }

  async findById(id: string): Promise<IDeveloper | null> {
    return await Developer.findById(id);
  }

  async create(developerData: Partial<IDeveloper>): Promise<IDeveloper> {
    return await Developer.create(developerData);
  }

  async update(id: string, developerData: Partial<IDeveloper>): Promise<IDeveloper | null> {
    return await Developer.findByIdAndUpdate(id, developerData, {
      new: true,
      runValidators: true
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await Developer.findByIdAndDelete(id);
    return result !== null;
  }

  async findByName(name: string): Promise<IDeveloper | null> {
    return await Developer.findOne({ name: { $regex: name, $options: "i" } });
  }
} 