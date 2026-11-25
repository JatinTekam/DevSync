import { Router } from "express";
import { validateBody } from "../../middleware/validate-body.js";
import { registerSchema } from "./auth.schemas.js";
import { registerController } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  validateBody(registerSchema),
  registerController,
);