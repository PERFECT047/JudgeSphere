import { Router } from "express";
import { requireAuth } from "../../../common/middleware/auth";
import * as submissionController from "../controllers/submission.controller";

const router = Router();

router.post("/run", requireAuth, submissionController.run);
router.post("/submit", requireAuth, submissionController.submit);
router.get("/:problemSlug", requireAuth, submissionController.getSubmissions);

export default router;