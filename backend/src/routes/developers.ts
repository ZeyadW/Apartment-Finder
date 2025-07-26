import express from "express";
import {
  createDeveloper,
  getDevelopers,
  getDeveloperById,
  updateDeveloper,
  deleteDeveloper,
} from "../controllers/developerController";

const router = express.Router();

router.post("/", createDeveloper);
router.get("/", getDevelopers);
router.get("/:id", getDeveloperById);
router.put("/:id", updateDeveloper);
router.delete("/:id", deleteDeveloper);

export default router; 