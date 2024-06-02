import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { REQ_BODY_SIZE_LIMIT } from "./constants.js";
import { errorHandling } from "./middlewares/errorHandling.middleware.js";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true,
  })
);

app.use(express.json({ limit: REQ_BODY_SIZE_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: REQ_BODY_SIZE_LIMIT }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter);

app.use(errorHandling);

export { app };
