import { Router } from "express";
import { validateBody } from "../../middleware/validate-body.js";
import { loginSchema, registerSchema } from "./auth.schemas.js";
import { loginController, logoutController, meController, refreshController, registerController } from "./auth.controller.js";
import { requireAuth } from "../../middleware/require-auth.js";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), registerController);

authRouter.post("/login", validateBody(loginSchema), loginController);

authRouter.post("/refresh",refreshController);

authRouter.post("/logout",logoutController);

authRouter.get("/me",requireAuth,meController);
