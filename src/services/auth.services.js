import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";

class AuthService {
  /**
   * Generate an access and refresh tokens for a given user
   * @param {object} user - the user object
   * @return {object} An object containing the access token and refresh token
   * @throws Will throw an error if the token generation fails
   */
  async generateAccessTokenAndRefreshToken(user) {
    try {
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

  /**
   * Validates user input data.
   * @param {object} userData the user data from the frontend
   * @throws Will throw an error if the validation fails
   */

  validateUserData(userData) {
    const { username, email } = userData;

    // validate - if username or email is doesn't exist
    if (!username || !email) {
      throw new ApiError(400, "username or email is required");
    }
  }

  /**
   * Finds a user by username or email.
   * @param {String} username - The username of the user.
   * @param {String} email - The email of the user.
   * @returns {Object} The user object if found.
   * @throws Will throw an error if the user is not found.
   */
  async findUser(username, email) {
    // check if user is present or not in database
    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (!user) {
      throw new ApiError(404, "user doesn't exist in database");
    }

    return user;
  }

  /**
   * Authenticates a user and generates tokens.
   * @param {Object} userData - The user data from the frontend.
   * @returns {Object} The authenticated user data and tokens.
   * @throws Will throw an error if authentication fails.
   */
  async authenticateUser(userData) {
    try {
      this.validateUserData(userData);

      // get the user details from frontend
      const { username, email, password } = userData;

      // find the user from the db
      const user = await this.findUser(username, email);

      // compare the passwords ( provided password and hashed password(of loggedInUser in db) )
      const isValidPassword = await user.isPasswordCorrect(password);

      if (!isValidPassword) {
        throw new ApiError(401, "Invalid credentials");
      }

      // generate the access and refresh token
      const tokens = await this.generateAccessTokenAndRefreshToken(user);

      // omit the password and refreshToken from user for sending the response
      const {
        password: omitPassword,
        refreshToken: omitRefreshToken,
        ...userWithoutSensitiveInfo
      } = user.toObject();

      return { user: userWithoutSensitiveInfo, ...tokens };
    } catch (err) {
      throw err;
    }
  }
}

// Export an instance of AuthService
export const authService = new AuthService();
