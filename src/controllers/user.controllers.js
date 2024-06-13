import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { userService } from "../services/user.services.js";
import { User } from "../models/user.model.js";

class UserController {
  registerUser = asyncHandler(async (req, res) => {
    try {
      // get the details of register user
      const userResponse = await userService.createUser(req.body, req.files);
      // send the response
      return res
        .status(201)
        .json(
          new ApiResponse(201, userResponse, "User registered successfully ")
        );
    } catch (err) {
      // handle the error
      throw new ApiError(
        500,
        "Somthing went wrong while register the user",
        err
      );
    }
  });

  changeCurrentPassword = asyncHandler(async (req, res) => {
    try {
      // get the password details from frontend
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword && !newPassword) {
        throw new ApiError(400, "old and new password are required");
      }

      // we have the access of req.user with out password and refreshToken
      // bcz we verify user token in verifyJWT middleware and get req.user without password and refreshToken

      await userService.changePassword(req.user._id, oldPassword, newPassword);

      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password has changed successfully"));
    } catch (err) {
      throw new ApiError(
        500,
        "Something went wrong while changing the password",
        err
      );
    }
  });
}

export const userController = new UserController();
