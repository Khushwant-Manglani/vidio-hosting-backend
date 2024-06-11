import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { userService } from "../services/user.services.js";
import { authService } from "../services/auth.services.js";

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

  loginUser = asyncHandler(async (req, res) => {
    try {
      // get the details of login user
      const { user, accessToken, refreshToken } = authService.authenticateUser(
        req.body
      );

      // create secure options for cookies
      const options = {
        httpOnly: true,
        secure: true,
        sameSite: "strict", // add sameSite attribute for better security
      };

      // set the accessToken and refreshToken in cookies and send the response
      res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(
            200,
            {
              user,
              accessToken,
              refreshToken,
            },
            "User logged in successfully"
          )
        );
    } catch (err) {
      throw new ApiError(500, "Something went wrong while login the user", err);
    }
  });
}

export const userController = new UserController();
