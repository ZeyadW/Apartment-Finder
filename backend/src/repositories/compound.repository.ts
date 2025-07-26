import { ICompound } from '../models/Compound';
import Compound from '../models/Compound';

export interface ICompoundRepository {
  findAll(): Promise<ICompound[]>;
  findById(id: string): Promise<ICompound | null>;
  create(compoundData: Partial<ICompound>): Promise<ICompound>;
  update(id: string, compoundData: Partial<ICompound>): Promise<ICompound | null>;
  delete(id: string): Promise<boolean>;
  findByName(name: string): Promise<ICompound | null>;
}

export class CompoundRepository implements ICompoundRepository {
  async findAll(): Promise<ICompound[]> {
    return await Compound.find().sort({ name: 1 });
  }

  async findById(id: string): Promise<ICompound | null> {
    return await Compound.findById(id);
  }

  async create(compoundData: Partial<ICompound>): Promise<ICompound> {
    return await Compound.create(compoundData);
  }

  async update(id: string, compoundData: Partial<ICompound>): Promise<ICompound | null> {
    return await Compound.findByIdAndUpdate(id, compoundData, {
      new: true,
      runValidators: true
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await Compound.findByIdAndDelete(id);
    return result !== null;
  }

  async findByName(name: string): Promise<ICompound | null> {
    return await Compound.findOne({ name: { $regex: name, $options: "i" } });
  }
} 