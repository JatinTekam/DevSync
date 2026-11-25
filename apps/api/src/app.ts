import cors from "cors";
import express from "express";
import { corsOptions } from "./config/cors.js";

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

  return app;
}
