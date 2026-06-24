import { Router } from "express";
import { reviewCodeController, generateHintController } from "./aiReview.controller.js";
import { requireAuth } from "../../common/middleware/auth.js";

const router = Router();

router.post("/review", requireAuth, reviewCodeController);
router.post("/hint", requireAuth, generateHintController);

export default router;