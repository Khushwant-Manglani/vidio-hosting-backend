import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";

class AuthService {
  async generateAccessTokenAndRefreshToken(user) {
    try {
      // user is object of our user model we have given the methods in user model
      // to generate access and refresh token
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      // update the refreshToken in user object
      user.refreshToken = refreshToken;
      // save the object and doesn't validate before save bcz password in required in model
      await user.save({ validateBeforeSave: false });
      // return the access and refresh token
      return { accessToken, refreshToken };
    } catch (err) {
      throw new ApiError(
        500,
        "Something went wrong while generating an access and refresh token"
      );
    }
  }

  async authenticateUser(userData) {
    try {
      // get the user details from frontend
      const { username, email, password } = userData;

      // validate - if username or email is empty
      if (!username || !email) {
        throw new ApiError(400, "username or email is required");
      }

      // check if user is present or not in database
      const loggedInUser = await User.findOne({
        $or: [{ username }, { email }],
      });

      if (!loggedInUser) {
        throw new ApiError(404, "user doesn't exist in database");
      }

      // compare the passwords ( provided password and hashed password(of loggedInUser in db) )
      const isValidPassword = await loggedInUser.isPasswordCorrect(password);

      if (!isValidPassword) {
        throw new ApiError(401, "Invalid credentials");
      }

      // generate the access and refresh token
      const tokens =
        await this.generateAccessTokenAndRefreshToken(loggedInUser);

      // omit the password and refreshToken from loggedInUser for sending the response
      const {
        password: omitPassword,
        refreshToken: omitRefreshToken,
        ...loginInUserWithoutSensitiveInfo
      } = loggedInUser.toObject();

      return { user: loginInUserWithoutSensitiveInfo, ...tokens };
    } catch (err) {
      throw err;
    }
  }
}

export const authService = new AuthService();
