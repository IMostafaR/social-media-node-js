import { db } from "../database/connection.js";
// import { globalErrorHandler } from "./middleware/error/globalErrorHandler.js";
// import { AppError } from "./utils/error/appError.js";
import morgan from "morgan";

export const router = (app, express) => {
  process.on("unhandledRejection", (error) => {
    console.error("Error: ", error);
  });
  process.on("uncaughtException", (error) => {
    console.error("Error: ", error);
  });

  db();

  app.use(express.json());
  app.use(morgan("dev"));

  app.all("*", (req, res, next) => {
    next(new AppError(`invalid routing ${req.originalUrl}`, 404));
  });
  //   app.use(globalErrorHandler());
};
