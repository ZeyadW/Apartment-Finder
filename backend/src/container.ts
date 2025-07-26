import { ApartmentRepository } from './repositories/apartment.repository';
import { ApartmentService } from './services/apartment.service';
import { DeveloperRepository } from './repositories/developer.repository';
import { DeveloperService } from './services/developer.service';
import { CompoundRepository } from './repositories/compound.repository';
import { CompoundService } from './services/compound.service';

// Simple dependency injection container with lazy loading
class Container {
  private static instance: Container;
  private services: Map<string, any> = new Map();
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private initializeServices(): void {
    if (this.initialized) return;

    try {
      // Initialize repositories
      const apartmentRepository = new ApartmentRepository();
      const developerRepository = new DeveloperRepository();
      const compoundRepository = new CompoundRepository();

      this.services.set('ApartmentRepository', apartmentRepository);
      this.services.set('DeveloperRepository', developerRepository);
      this.services.set('CompoundRepository', compoundRepository);

      // Initialize services
      const apartmentService = new ApartmentService(apartmentRepository);
      const developerService = new DeveloperService(developerRepository);
      const compoundService = new CompoundService(compoundRepository);

      this.services.set('ApartmentService', apartmentService);
      this.services.set('DeveloperService', developerService);
      this.services.set('CompoundService', compoundService);

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing services:', error);
      throw error;
    }
  }

  public get<T>(serviceName: string): T {
    if (!this.initialized) {
      this.initializeServices();
    }

    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service as T;
  }
}

export default Container; 