import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { logger } from "../utils/logger.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );
    logger.info(
      `MONGODB Connected | DB HOST: ${connectionInstance.connections[0].host}`
    );
  } catch (err) {
    logger.error(`MONGODB Connection Failed`, err);
    process.exit(1);
  }
};

export default connectDB;
