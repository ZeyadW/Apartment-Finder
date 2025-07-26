import { Request, Response } from "express";
import { CompoundService } from "../services/compound.service";
import Container from "../container";
import Amenity from "../models/Amenity";

// Get service from container
const compoundService = Container.getInstance().get<CompoundService>('CompoundService');

export const createCompound = async (req: Request, res: Response) => {
  try {
    const compound = await compoundService.createCompound(req.body);
    res.status(201).json({
      success: true,
      data: compound,
    });
  } catch (error) {
    console.error("Error creating compound:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
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

export const getCompounds = async (_req: Request, res: Response) => {
  try {
    const compounds = await compoundService.getAllCompounds();
    res.status(200).json({
      success: true,
      count: compounds.length,
      data: compounds,
    });
  } catch (error) {
    console.error("Error fetching compounds:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getCompoundById = async (req: Request, res: Response) => {
  try {
    const compound = await compoundService.getCompoundById(req.params.id);
    
    if (!compound) {
      res.status(404).json({
        success: false,
        message: "Compound not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: compound,
    });
  } catch (error) {
    console.error("Error fetching compound:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateCompound = async (req: Request, res: Response) => {
  try {
    const compound = await compoundService.updateCompound(req.params.id, req.body);
    
    if (!compound) {
      res.status(404).json({
        success: false,
        message: "Compound not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: compound,
    });
  } catch (error) {
    console.error("Error updating compound:", error);
    
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
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteCompound = async (req: Request, res: Response) => {
  try {
    const deleted = await compoundService.deleteCompound(req.params.id);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Compound not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Compound deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting compound:", error);
    
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

 