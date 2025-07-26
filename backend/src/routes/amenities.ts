import express from "express";
import {
  getAllAmenities,
  createAmenity,
  updateAmenity,
  deleteAmenity,
} from "../controllers/amenityController";

const router = express.Router();

// Amenities routes
router.get("/", getAllAmenities);
router.post("/", createAmenity);
router.put("/:id", updateAmenity);
router.delete("/:id", deleteAmenity);

export default router; 