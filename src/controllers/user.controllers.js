import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  try {
    // get the user details from frontend
    const { username, email, fullName, password } = req.body;

    // validate - if any field is empty
    // if any of the field is (NaN, null, undefined, 0, "", false) then every gives falsy means false
    if (![username, email, fullName, password].every(Boolean)) {
      throw new ApiError(400, "All fields are required");
    }

    // check if user present by username or email
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ApiError(409, "User with username or email already exists");
    }

    // check for images path, specifically for avatar path
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required");
    }

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (
      req.files &&
      Array.isArray(req.files.coverImage) &&
      req.files.coverImage.length > 0
    ) {
      coverImageLocalPath = req.files.coverImage[0].path;
    }

    // upload avatar and coverImage(if present) on cloudinary
    const [avatar, coverImage] = await Promise.all([
      uploadOnCloudinary(avatarLocalPath),
      coverImageLocalPath ? uploadOnCloudinary(coverImageLocalPath) : null,
    ]);

    if (!avatar) {
      throw new ApiError(500, "Failed to upload avatar on cloudinary");
    }

    // create an user object - store it in database
    const user = new User({
      username: username.toLowerCase(),
      email,
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      password,
    });

    const createdUser = await user.save();

    // fetch the user by id from the database and omit(remove) the password and refreshToken
    const userResponse = await User.findById(createdUser._id).select([
      "-password",
      "-refreshToken",
    ]);

    if (!userResponse) {
      throw new ApiError(500, "Failed to retrieve the created user");
    }

    // send the response
    return res
      .status(201)
      .json(
        new ApiResponse(201, userResponse, "User registered successfully ")
      );
  } catch (err) {
    throw new ApiError(
      500,
      "Internal Server Error while register the user",
      err
    );
  }
});

export { registerUser };
