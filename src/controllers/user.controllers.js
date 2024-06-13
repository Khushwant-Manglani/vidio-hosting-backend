import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { userService } from "../services/user.services.js";

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
}

export const userController = new UserController();
