import { Document, Model, FilterQuery, UpdateQuery, PopulateOptions } from 'mongoose';

export interface QueryOptions {
  sort?: any;
  limit?: number;
  skip?: number;
  populate?: string | PopulateOptions | (string | PopulateOptions)[];
}

export interface IBaseRepository<T extends Document> {
  findById(id: string): Promise<T | null>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  findMany(filter: FilterQuery<T>, options?: QueryOptions): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: UpdateQuery<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  exists(filter: FilterQuery<T>): Promise<boolean>;
  count(filter: FilterQuery<T>): Promise<number>;
}

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async findById(id: string): Promise<T | null> {
    try {
      return await this.model.findById(id);
    } catch (error) {
      console.error(`Error in ${this.constructor.name}.findById:`, error);
      throw new Error('Failed to fetch document');
    }
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    try {
      return await this.model.findOne(filter);
    } catch (error) {
      console.error(`Error in ${this.constructor.name}.findOne:`, error);
      throw new Error('Failed to fetch document');
    }
  }

  async findMany(filter: FilterQuery<T>, options?: QueryOptions): Promise<T[]> {
    try {
      let query = this.model.find(filter);
      
      if (options?.sort) {
        query = query.sort(options.sort);
      }
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      if (options?.skip) {
        query = query.skip(options.skip);
      }
      
      if (options?.populate) {
        if (typeof options.populate === 'string') {
          query = query.populate(options.populate as string);
        } else {
          query = query.populate(options.populate as PopulateOptions | (string | PopulateOptions)[]);
        }
      }
      
      return await query.exec();
    } catch (error) {
      console.error(`Error in ${this.constructor.name}.findMany:`, error);
      throw new Error('Failed to fetch documents');
    }
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      return await this.model.create(data);
    } catch (error) {
      console.error(`Error in ${this.constructor.name}.create:`, error);
      if (error instanceof Error && error.message.includes('validation failed')) {
        throw new Error('Invalid data provided');
      }
      throw new Error('Failed to create document');
    }
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    try {
      return await this.model.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
      });
    } catch (error) {
      console.error(`Error in ${this.constructor.name}.update:`, error);
      if (error instanceof Error && error.message.includes('validation failed')) {
        throw new Error('Invalid data provided');
      }
      throw new Error('Failed to update document');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      console.error(`Error in ${this.constructor.name}.delete:`, error);
      throw new Error('Failed to delete document');
    }
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    try {
      const count = await this.model.countDocuments(filter);
      return count > 0;
    } catch (error) {
      console.error(`Error in ${this.constructor.name}.exists:`, error);
      throw new Error('Failed to check document existence');
    }
  }

  async count(filter: FilterQuery<T>): Promise<number> {
    try {
      return await this.model.countDocuments(filter);
    } catch (error) {
      console.error(`Error in ${this.constructor.name}.count:`, error);
      throw new Error('Failed to count documents');
    }
  }
} 