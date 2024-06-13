import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import UserService from "../services/user.services.js";

const userService = new UserService(User); // inject User model dependency

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

  changeCurrentUserPassword = asyncHandler(async (req, res) => {
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

  getCurrentUser = asyncHandler(async (req, res) => {
    // we verify user token in verifyJWT middleware and get req.user without password and refreshToken
    // send the responce of the current user by req.user
    return res
      .status(200)
      .json(
        new ApiResponse(200, req.user, "Current user fetched successfully")
      );
  });

  updateUserAccountDetails = asyncHandler(async (req, res) => {
    try {
      // get the details from frontend
      const { fullName, email } = req.body;

      // validate bcz both field are required
      if (!fullName && !email) {
        throw new ApiError(400, "All fields are required");
      }

      // we verify user token in verifyJWT middleware and get req.user without password and refreshToken
      // we retrive the user by req.user._id and then update the fullName and email and ommiting the password
      // and get the updated user
      const updatedUser = await userService.updateUserDetails(
        req.user._id,
        fullName,
        email
      );

      // send the updated details user response
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedUser,
            "User details are updated successfully"
          )
        );
    } catch (err) {
      throw new ApiError(
        500,
        "Something went wrong while updating the user details",
        err
      );
    }
  });

  updateUserAvatar = asyncHandler(async (req, res) => {
    try {
      const updatedUser = await userService.updateUserFileImage(
        req.user._id,
        req.file,
        "avatar"
      );
      return res
        .status(200)
        .json(
          new ApiResponse(200, updatedUser, "Avatar image updated successfully")
        );
    } catch (err) {
      throw new ApiError(
        500,
        "Something went wrong while updating an avatar",
        err
      );
    }
  });

  updateUserCoverImage = asyncHandler(async (req, res) => {
    try {
      const updatedUser = await userService.updateUserFileImage(
        req.user._id,
        req.file,
        "coverImage"
      );
      return res
        .status(200)
        .json(
          new ApiResponse(200, updatedUser, "Cover image updated successfully")
        );
    } catch (err) {
      throw new ApiError(
        500,
        "Something went wrong while updating an cover image",
        err
      );
    }
  });
}

export const userController = new UserController();
