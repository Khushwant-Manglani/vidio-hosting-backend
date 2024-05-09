import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./.env"
});

connectDB();















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
