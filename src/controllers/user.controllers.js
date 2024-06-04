import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessTokenAndRefreshToken = async (user) => {
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
};

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

const loginUser = asyncHandler(async (req, res) => {
  try {
    // get the user details from frontend
    const { username, email, password } = req.body;

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
    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(loggedInUser);

    // omit the password and refreshToken from loggedInUser to send the response
    await loggedInUser.select(["password", "refreshToken"]);

    // create secure options for cookies
    const options = {
      httpOnly: true,
      secure: true,
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
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "User logged in successfully"
        )
      );
  } catch (err) {
    throw new ApiError(500, "Something went wrong while login the user");
  }
});

export { registerUser, loginUser };
