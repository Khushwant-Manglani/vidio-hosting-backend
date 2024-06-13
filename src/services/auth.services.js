import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

class AuthService {
  constructor(UserModel) {
    this.User = UserModel;
  }

  /**
   * Generate an access and refresh tokens for a given user
   * @param {object} user - the user object
   * @return {object} An object containing the access token and refresh token
   * @throws Will throw an error if the token generation fails
   */
  async generateAccessTokenAndRefreshToken(user) {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // update the refreshToken in user object
    user.refreshToken = refreshToken;

    // save the object and doesn't validate before save bcz password in required in model
    await user.save({ validateBeforeSave: false });

    // return the access and refresh token
    return { accessToken, refreshToken };
  }

  /**
   * Validates user input data.
   * @param {object} userData the user data from the frontend
   * @throws Will throw an error if the validation fails
   */

  validateUserData(userData) {
    const { username, email } = userData;

    // validate - if username or email is doesn't exist
    if (!username && !email) {
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
    const user = await this.User.findOne({
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
  }

  /**
   * Clear the user refresh token from database
   * @param {string} userId - the ID of the user
   * @returns {Promise} - The promise object representing the update operation
   */
  async clearUserRefreshToken(userId) {
    // find user by id and update the refreshToken to undefined
    return await this.User.findByIdAndUpdate(
      userId,
      {
        $set: {
          refreshToken: undefined,
        },
      },
      {
        new: true,
      }
    );
  }

  /**
   * Refreshes the access and refresh tokens
   * @param {string} incomingRefreshToken - the incoming refresh token.
   * @return {Promise<Object>} The new access and refresh token.
   * @throws Will throw an error if the refresh token is invalid or expired
   */

  async refreshTokens(incomingRefreshToken) {
    // verify refresh token and decode the payload
    const decoded = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // retrieve the user by token payload
    const user = await this.User.findById(decoded._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // check if the provided refresh token and store database refresh token match or not
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    // return the newly generated access and refresh token
    return await this.generateAccessTokenAndRefreshToken(user);
  }
}

// export the AuthService class
export default AuthService;
