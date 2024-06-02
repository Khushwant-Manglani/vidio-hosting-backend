import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { logger } from "./utils/logger.js";

const port = process.env.PORT || 8000;

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.on("error", (err) => {
      logger.error(`MONGODB Connection Failed: ${err}`);
    });

    app.listen(port, () => {
      logger.info(`Server is listening at port: , ${port}`);
    });
  })
  .catch((err) => {
    logger.error(`MONGODB Connection Failed: ${err}`);
  });

/*

import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import express from "express";
const app = express();

( async () => {
  
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
    
    app.on("error", (err) => {
      console.log(`MONGODB Connection ERROR: `, err);
      throw err;
    })

    app.listen(process.env.PORT, () => {
      console.log(`App is listening at port: `, process.env.PORT);
    })

  } catch(err) {
    console.log(`MONGODB Connection ERROR: `, err);
    throw err;
  }

} )();

*/
