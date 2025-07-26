import express from "express";
import {
  createCompound,
  getCompounds,
  getCompoundById,
  updateCompound,
  deleteCompound,
} from "../controllers/compoundController";

const router = express.Router();

router.post("/", createCompound);
router.get("/", getCompounds);
router.get("/:id", getCompoundById);
router.put("/:id", updateCompound);
router.delete("/:id", deleteCompound);

export default router; 