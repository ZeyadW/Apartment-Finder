import { Request, Response } from "express";
import { DeveloperService } from "../services/developer.service";
import Container from "../container";

// Get service from container
const developerService = Container.getInstance().get<DeveloperService>('DeveloperService');

export const createDeveloper = async (req: Request, res: Response) => {
  try {
    const developer = await developerService.createDeveloper(req.body);
    res.status(201).json({
      success: true,
      data: developer,
    });
  } catch (error) {
    console.error("Error creating developer:", error);
    
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

export const getDevelopers = async (_req: Request, res: Response) => {
  try {
    const developers = await developerService.getAllDevelopers();
    res.status(200).json({
      success: true,
      count: developers.length,
      data: developers,
    });
  } catch (error) {
    console.error("Error fetching developers:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getDeveloperById = async (req: Request, res: Response) => {
  try {
    const developer = await developerService.getDeveloperById(req.params.id);
    
    if (!developer) {
      res.status(404).json({
        success: false,
        message: "Developer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: developer,
    });
  } catch (error) {
    console.error("Error fetching developer:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateDeveloper = async (req: Request, res: Response) => {
  try {
    const developer = await developerService.updateDeveloper(req.params.id, req.body);
    
    if (!developer) {
      res.status(404).json({
        success: false,
        message: "Developer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: developer,
    });
  } catch (error) {
    console.error("Error updating developer:", error);
    
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

export const deleteDeveloper = async (req: Request, res: Response) => {
  try {
    const deleted = await developerService.deleteDeveloper(req.params.id);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Developer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Developer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting developer:", error);
    
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