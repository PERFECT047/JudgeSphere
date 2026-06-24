import { Router } from "express";
import * as problemController from "../controllers/problem.controller.js";
import { requireAuth } from "../../../common/middleware/auth.js";

const router = Router();

// Authenticated problems list
router.get("/problems", requireAuth, problemController.getProblems);
router.get("/problems/stats", problemController.getProblemStats);
router.get("/problems/tags", problemController.getAllTags);
router.get("/problems/topics", problemController.getAllTopics);
router.get("/problems/count", problemController.getProblemCount);
router.get("/problems/:id", problemController.getProblemById);
router.get("/problems/slug/:slug", problemController.getProblemBySlug);

// Admin routes (could add auth middleware later)
router.post("/problems/import", problemController.importProblems);
router.delete("/problems", problemController.deleteAllProblems);

export default router;