import express from "express";
import {
  register,
  login,
  getMe,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
} from "../controllers/authController";
import { auth, requireAdmin } from "../middleware/auth";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", auth, getMe);

// Admin only routes
router.get("/users", auth, requireAdmin, getAllUsers);
router.put("/users/:id/role", auth, requireAdmin, updateUserRole);
router.put("/users/:id/toggle-status", auth, requireAdmin, toggleUserStatus);

export default router; 
 