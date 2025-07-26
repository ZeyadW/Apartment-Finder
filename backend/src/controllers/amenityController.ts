import { Request, Response } from "express";
import Amenity from "../models/Amenity";

export const getAllAmenities = async (_req: Request, res: Response) => {
  try {
    const amenities = await Amenity.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: amenities.length,
      data: amenities,
    });
  } catch (error) {
    console.error("Error fetching amenities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch amenities. Please try again.",
    });
  }
};

export const createAmenity = async (req: Request, res: Response) => {
  try {
    const amenity = await Amenity.create(req.body);
    res.status(201).json({
      success: true,
      data: amenity,
    });
  } catch (error) {
    console.error("Error creating amenity:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values((error as any).errors).map((err: any) => err.message);
        res.status(400).json({
          success: false,
          message: validationErrors.join(', '),
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to create amenity. Please try again.",
    });
  }
};

export const updateAmenity = async (req: Request, res: Response) => {
  try {
    const amenity = await Amenity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!amenity) {
      res.status(404).json({
        success: false,
        message: "Amenity not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: amenity,
    });
  } catch (error) {
    console.error("Error updating amenity:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      if (error.message.includes('already exists')) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values((error as any).errors).map((err: any) => err.message);
        res.status(400).json({
          success: false,
          message: validationErrors.join(', '),
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to update amenity. Please try again.",
    });
  }
};

export const deleteAmenity = async (req: Request, res: Response) => {
  try {
    const deleted = await Amenity.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Amenity not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Amenity deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting amenity:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete amenity. Please try again.",
    });
  }
}; 