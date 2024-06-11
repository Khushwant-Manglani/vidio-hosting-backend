import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { userController } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  userController.registerUser
);
router.route("/login", userController.loginUser);
router.route("/logout", verifyJWT, userController.logoutUser);

export default router;
