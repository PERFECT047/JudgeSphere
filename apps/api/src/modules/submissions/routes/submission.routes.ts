import { Router } from "express";
import { requireAuth } from "../../../common/middleware/auth.js";
import * as submissionController from "../controllers/submission.controller.js";

const router = Router();

router.post("/run", requireAuth, submissionController.run);
router.post("/submit", requireAuth, submissionController.submit);
router.post("/run-custom", requireAuth, submissionController.runCustomTestCase);
router.get("/:problemSlug", requireAuth, submissionController.getSubmissions);

export default router;