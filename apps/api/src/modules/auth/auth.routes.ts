import { Router } from "express";
import { validateBody } from "../../middleware/validate-body.js";
import { loginSchema, registerSchema } from "./auth.schemas.js";
import { loginController, registerController } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), registerController);

authRouter.post("/login", validateBody(loginSchema), loginController);
