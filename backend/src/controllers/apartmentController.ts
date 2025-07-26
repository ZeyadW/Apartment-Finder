import { Request, Response } from "express";
import { IApartment } from "../models/Apartment";
import { ApartmentService } from "../services/apartment.service";
import { QueryApartmentsDto } from "../dtos/query-apartments.dto";
import Container from "../container";
import Amenity from "../models/Amenity";
import { AppError } from "../middleware/error.middleware";

// Get service from container (lazy loading)
const getApartmentService = (): ApartmentService => {
  return Container.getInstance().get<ApartmentService>('ApartmentService');
};

// Get all apartments with search and filter functionality
export const getApartments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const apartmentService = getApartmentService();
    const queryDto = (req as any).validatedQuery as QueryApartmentsDto;
    
    const apartments = await apartmentService.getAllApartments(queryDto);

    res.status(200).json({
      success: true,
      count: apartments.length,
      data: apartments,
    });
  } catch (error) {
    console.error("Error fetching apartments:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get all apartments for admin (including unavailable ones)
export const getAllApartmentsForAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const apartmentService = getApartmentService();
    const queryDto = (req as any).validatedQuery as QueryApartmentsDto;
    
    // For admin, we want to see all apartments regardless of availability
    const queryWithAllAvailability = {
      ...queryDto,
      isAvailable: undefined // This will bypass the availability filter
    };
    
    const apartments = await apartmentService.getAllApartmentsForAdmin(queryWithAllAvailability);

    res.status(200).json({
      success: true,
      count: apartments.length,
      data: apartments,
    });
  } catch (error) {
    console.error("Error fetching all apartments for admin:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get single apartment by ID
export const getApartmentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const apartmentService = getApartmentService();
    const apartment = await apartmentService.getApartmentById(req.params.id);

    if (!apartment) {
      res.status(404).json({
        success: false,
        message: "Apartment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: apartment,
    });
  } catch (error) {
    console.error("Error fetching apartment:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Create new apartment
export const createApartment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const apartmentService = getApartmentService();
    const userId = (req as any).user._id;
    const apartmentData = { ...req.body, agent: userId };

    // Validate amenities
    if (apartmentData.amenities && Array.isArray(apartmentData.amenities)) {
      for (const amenityId of apartmentData.amenities) {
        const amenity = await Amenity.findById(amenityId);
        if (!amenity) {
          res.status(400).json({
            success: false,
            message: `Amenity not found: ${amenityId}`,
          });
          return;
        }
      }
    }
    
    const apartment = await apartmentService.createApartment(apartmentData);

    res.status(201).json({
      success: true,
      data: apartment,
    });
  } catch (error) {
    console.error("Error creating apartment:", error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update apartment
export const updateApartment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const apartmentService = getApartmentService();
    const apartmentData = req.body;

    // Validate amenities
    if (apartmentData.amenities && Array.isArray(apartmentData.amenities)) {
      for (const amenityId of apartmentData.amenities) {
        const amenity = await Amenity.findById(amenityId);
        if (!amenity) {
          res.status(400).json({
            success: false,
            message: `Amenity not found: ${amenityId}`,
          });
          return;
        }
      }
    }
    
    const apartment = await apartmentService.updateApartment(req.params.id, apartmentData);

    if (!apartment) {
      res.status(404).json({
        success: false,
        message: "Apartment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: apartment,
    });
  } catch (error) {
    console.error("Error updating apartment:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete apartment
export const deleteApartment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const apartmentService = getApartmentService();
    const deleted = await apartmentService.deleteApartment(req.params.id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Apartment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Apartment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting apartment:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get my listings (for agents)
export const getMyListings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const apartmentService = getApartmentService();
    const userId = (req as any).user._id;
    const apartments = await apartmentService.getMyListings(userId);

    res.status(200).json({
      success: true,
      count: apartments.length,
      data: apartments,
    });
  } catch (error) {
    console.error("Error fetching my listings:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Toggle apartment availability
export const toggleAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const apartmentService = getApartmentService();
    const apartment = await apartmentService.toggleAvailability(req.params.id);

    if (!apartment) {
      res.status(404).json({
        success: false,
        message: "Apartment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: apartment,
      message: `Apartment is now ${apartment.isAvailable ? 'available' : 'unavailable'}`,
    });
  } catch (error) {
    console.error("Error toggling availability:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get user favorites
export const getFavorites = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const apartmentService = getApartmentService();
    const userId = (req as any).user._id;
    const apartments = await apartmentService.getFavorites(userId);

    res.status(200).json({
      success: true,
      count: apartments.length,
      data: apartments,
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Add apartment to favorites
export const addToFavorites = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const apartmentService = getApartmentService();
    const userId = (req as any).user._id;
    const apartment = await apartmentService.addToFavorites(
      req.params.id,
      userId
    );

    if (!apartment) {
      res.status(404).json({
        success: false,
        message: "Apartment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: apartment,
      message: "Apartment added to favorites",
    });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Remove apartment from favorites
export const removeFromFavorites = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const apartmentService = getApartmentService();
    const userId = (req as any).user._id;
    const apartment = await apartmentService.removeFromFavorites(
      req.params.id,
      userId
    );

    if (!apartment) {
      res.status(404).json({
        success: false,
        message: "Apartment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: apartment,
      message: "Apartment removed from favorites",
    });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
