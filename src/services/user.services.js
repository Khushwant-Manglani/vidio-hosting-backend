import { User } from "../models/user.model";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { ApiError } from "../utils/ApiError";

class UserService {
  /**
   * Validates user data to ensure no field is empty.
   * @param {Object} userData - The user data from the request.
   * @throws Will throw an error if any field is empty.
   */
  validateUserData(userData) {
    // get the user details
    const { username, email, fullName, password } = userData;

    // if any of the field is (NaN, null, undefined, 0, "", false) then every gives falsy means false
    if (![username, email, fullName, password].every(Boolean)) {
      throw new ApiError(400, "All fields are required");
    }
  }

  /**
   * Checks if a user with the provided username or email already exists.
   * @param {String} username - The username to check.
   * @param {String} email - The email to check.
   * @returns {Promise<void>}
   * @throws Will throw an error if a user with the username or email already exists.
   */
  async checkExistingUser(username, email) {
    // retrieve the user from database
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ApiError(409, "User with username or email already exists");
    }
  }

  /**
   * Retrieves the local path of an image file from the uploaded files.
   * @param {Object} files - The files uploaded.
   * @param {String} fieldName - The name of the field containing the image.
   * @returns {String|null} The local path of the image file, or null if not found.
   */
  getImageLocalPath(files, fieldName) {
    if (
      files &&
      Array.isArray(files[fieldName]) &&
      files[fieldName].length > 0
    ) {
      // image local path found
      return files[fieldName][0].path;
    }

    // image local path not found return null
    return null;
  }

  /**
   * Uploads the avatar and cover image (if present) to Cloudinary.
   * @param {Object} files - The files uploaded.
   * @returns {Object} An object containing the URLs of the uploaded images.
   * @throws Will throw an error if the avatar upload fails or if the avatar file is missing.
   */
  async uploadImage(files) {
    // get the local path of avatar
    const avatarLocalPath = this.getImageLocalPath(files, "avatar");
    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required");
    }

    // get the local path of coverImage
    const coverImageLocalPath = this.getImageLocalPath(files, "coverImage");

    // upload avatar and coverImage(if present) on cloudinary
    const [avatar, coverImage] = await Promise.all([
      uploadOnCloudinary(avatarLocalPath),
      coverImageLocalPath ? uploadOnCloudinary(coverImageLocalPath) : null,
    ]);

    if (!avatar) {
      throw new ApiError(500, "Failed to upload avatar on cloudinary");
    }

    return { avatarUrl: avatar.url, coverImageUrl: coverImage?.url || "" };
  }

  /**
   * Creates a new user with the provided data and files.
   * @param {Object} userData - The user data from the request.
   * @param {Object} files - The files uploaded.
   * @returns {Object} The created user without sensitive information.
   * @throws Will throw an error if any step in the process fails.
   */
  async createUser(userData, files) {
    try {
      // get the user details from request by destructure
      const { username, email, fullName, password } = userData;

      // validate the user data
      this.validateUserData(userData);

      // check if user present by username or email
      await this.checkExistingUser(username, email);

      const { avatarUrl, coverImageUrl } = await this.uploadImage(files);

      // create an user object - save it in database
      const user = new User({
        username: username.toLowerCase(),
        email,
        fullName,
        avatar: avatarUrl,
        coverImage: coverImageUrl,
        password,
      });

      const createdUser = await user.save();

      // retrieve the user by id from the database and omit(remove) the password and refreshToken
      const userResponse = await User.findById(createdUser._id).select([
        "-password",
        "-refreshToken",
      ]);

      if (!userResponse) {
        throw new ApiError(500, "Failed to retrieve the created user");
      }

      // return the response
      return userResponse;
    } catch (err) {
      // throw the error that can be handle in catch of route
      throw err;
    }
  }
}

// export an instance of the UserService Class
export const userService = new UserService();
