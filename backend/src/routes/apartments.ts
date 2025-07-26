import express from "express";
import {
  getApartments,
  getAllApartmentsForAdmin,
  getApartmentById,
  createApartment,
  updateApartment,
  deleteApartment,
  getMyListings,
  toggleAvailability,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
} from "../controllers/apartmentController";
import { auth, requireAgent, requireAdmin } from "../middleware/auth";
import { validateDto } from "../middleware/validation.middleware";
import { QueryApartmentsDto } from "../dtos/query-apartments.dto";

const router = express.Router();

// GET /api/apartments - Get all apartments with search/filter
router.get("/", validateDto(QueryApartmentsDto), getApartments);

// GET /api/apartments/admin - Get all apartments for admin (including unavailable ones)
router.get("/admin", auth, requireAdmin, validateDto(QueryApartmentsDto), getAllApartmentsForAdmin);

// GET /api/apartments/my-listings - Get current user's listings (Auth required)
router.get("/my-listings", auth, getMyListings);

// GET /api/apartments/favorites - Get user's favorite apartments (Auth required)
router.get("/favorites", auth, getFavorites);

// GET /api/apartments/:id - Get single apartment
router.get("/:id", getApartmentById);

// POST /api/apartments - Create new apartment (Auth required)
router.post("/", auth, requireAgent, createApartment);

// PUT /api/apartments/:id - Update apartment (Auth required)
router.put("/:id", auth, requireAgent, updateApartment);

// DELETE /api/apartments/:id - Delete apartment (Auth required)
router.delete("/:id", auth, requireAgent, deleteApartment);

// PUT /api/apartments/:id/toggle-availability - Toggle apartment availability (Auth required)
router.put("/:id/toggle-availability", auth, toggleAvailability);

// POST /api/apartments/:id/favorite - Add apartment to favorites (Auth required)
router.post("/:id/favorite", auth, addToFavorites);

// DELETE /api/apartments/:id/favorite - Remove apartment from favorites (Auth required)
router.delete("/:id/favorite", auth, removeFromFavorites);

export default router;
