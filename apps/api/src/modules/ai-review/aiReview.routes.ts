import { Router } from "express";
import { reviewCodeController } from "./aiReview.controller";
import { requireAuth } from "../../common/middleware/auth";

const router = Router();

router.post("/review", requireAuth, reviewCodeController);

export default router;