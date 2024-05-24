import mongoose, { Schema } from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const userSchema = Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary url
      required: true,
    },
    coverImage: {
      type: String, // cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// using pre hook middleware to hash the password before saving user model
userSchema.pre(
  "save",
  asyncHandler(async function (next) {
    if (this.isModified("password")) {
      try {
        const salt = bcryptjs.genSalt(process.env.saltRounds);
        const hashedPassword = bcryptjs.hash(this.password, salt);
        this.password = hashedPassword;
      } catch (err) {
        throw ApiError(
          500,
          "Something went wrong while hashing the password before saving the userSchema"
        );
      }
    }
    next();
  })
);

// create custom method for check the provided password is match with the stored hash passsword
userSchema.methods.isPasswordCorrect = asyncHandler(async function (password) {
  try {
    return await bcryptjs.compare(password, this.password);
  } catch (err) {
    throw ApiError(500, "Something went wrong while comparing the passwords");
  }
});

// create custom method for generate access token
userSchema.methods.generateAccessToken = asyncHandler(function () {
  try {
    const accessToken = jwt.sign(
      {
        _id: this._id,
        username: this.username,
        email: this.email,
        fullName: this.fullName,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );
    return accessToken;
  } catch (err) {
    throw ApiError(
      500,
      "Something went wrong while generating an access token"
    );
  }
});

// create custom method for generate refresh token
userSchema.methods.generateRefreshToken = asyncHandler(function () {
  try {
    const refreshToken = jwt.sign(
      {
        _id: this._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );
    return refreshToken;
  } catch (err) {
    throw ApiError(
      500,
      "Something went wrong while generating an refresh token"
    );
  }
});

export const User = mongoose.model("User", userSchema);
