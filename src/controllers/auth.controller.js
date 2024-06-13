import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { authService } from "../services/auth.services.js";

class AuthController {
  loginUser = asyncHandler(async (req, res) => {
    try {
      // get the details of login user
      const { user, accessToken, refreshToken } =
        await authService.authenticateUser(req.body);

      // create secure options for cookies
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        // sameSite: "strict", // add sameSite attribute for better security
      };

      // set the accessToken and refreshToken in cookies and send the response
      res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
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

  logoutUser = asyncHandler(async (req, res) => {
    try {
      await authService.logoutUser(req.user, res);
    } catch (err) {
      throw new ApiError(
        500,
        "Something went wrong while logout the user",
        err
      );
    }
  });

  /**
   * Refresh the access token using the provided refresh token.
   * @param {object} req - the request object
   * @param {object} res - the response object
   * @throw Will throw the error when refresh token is invalid or missing
   */

  refreshAccessToken = asyncHandler(async (req, res) => {
    try {
      const incommingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

      if (!incommingRefreshToken) {
        throw new ApiError(401, "Unauthorized access");
      }

      const { accessToken, refreshToken } = await authService.refreshTokens(
        incommingRefreshToken
      );

      res
        .status(200)
        .cookie("accessToken", accessToken)
        .cookie("refreshToken", refreshToken)
        .json(
          new ApiResponse(
            200,
            { accessToken, refreshToken },
            "Access token refreshed successfully"
          )
        );
    } catch (err) {
      throw new ApiError(
        401,
        "Something went wrong while refresh the access token",
        err
      );
    }
  });
}

export const authController = new AuthController();
