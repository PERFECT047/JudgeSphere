import { Router } from "express";
import { reviewCodeController } from "./aiReview.controller.js";
import { requireAuth } from "../../common/middleware/auth.js";

const router = Router();

router.post("/review", requireAuth, reviewCodeController);

export default router;