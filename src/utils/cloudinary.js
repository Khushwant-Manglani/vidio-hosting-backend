import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    // check if the local file path is exist
    if (!localFilePath) return null;

    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // file has been uploaded successfully
    // logger.info("File is uploaded on cloudinary: ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (err) {
    // if the upload file on cloudinary operation gets fail then remove the locally saved temporary file .
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
