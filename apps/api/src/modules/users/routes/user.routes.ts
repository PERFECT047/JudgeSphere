import { Router } from "express";
import { requireAuth } from "../../../common/middleware/auth.js";
import * as userController from "../controllers/user.controller.js";


const router = Router();

// Auth routes
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/refresh", userController.refresh);
router.post("/logout", userController.logout);

// Profile routes (protected)
router.get("/me", requireAuth, userController.getProfile);
router.put("/profile", requireAuth, userController.updateProfile);
router.put("/password", requireAuth, userController.changePassword);

// Dashboard
router.get("/dashboard/stats", requireAuth, userController.getDashboardStats);

export default router;
