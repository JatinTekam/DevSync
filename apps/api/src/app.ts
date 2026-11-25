import cors from "cors";
import express from "express";
import { corsOptions } from "./config/cors.js";
import { errorHandler } from "./middleware/error-handler.js";
import { AppError } from "./shared/errors/app-error.js";

export function createApp() {
  const app = express();

  app.use(cors(corsOptions));
  app.use(express.json());

  //Routes
  app.get("/api/v1/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "devsync-api",
    });
  });

  app.use((_req, _res, next) => {
    next(new AppError(404, "NOT_FOUND", "Route not found"));
  });

  app.use(errorHandler);

  return app;
}
