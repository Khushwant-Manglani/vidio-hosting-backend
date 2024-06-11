import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";

/**
 * Middleware to verify the token by jwt and attach the user to request object
 * @param {object} req - the request object.
 * @param {object} _ - the response object (not used).
 * @param {function} next - the next middleware function.
 * @throws Will throw an error if the token is missing, or if the user not found
 */

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // Extract the token from cookies or Authorization header
    const token =
      req.cookies.accessToken || req.header("Authorization").split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Access denied, token not found.");
    }

    // verify token and decode payload
    const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // retrieve the user by id from token payload and exclude the sensitive fields
    const user = await User.findById(decoded?._id).select([
      "-password",
      "-refreshToken",
    ]);

    if (!user) {
      throw new ApiError(401, "Invalid access token, user not found");
    }

    // attach user to request object
    req.user = user;

    // proceed to next middleware
    next();
  } catch (err) {
    throw new ApiError(401, err.message || "Invalid access token");
  }
});

export { verifyJWT };
