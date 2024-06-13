import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authController } from "../controllers/auth.controller.js";

const router = Router();

router.route("/login").post(authController.loginUser);
router.route("/logout").post(verifyJWT, authController.logoutUser);
router.route("/refresh-token").post(authController.refreshAccessToken);

export default router;
