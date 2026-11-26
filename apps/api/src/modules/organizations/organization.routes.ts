import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { listOrganizationsController } from "./organization.controller.js";

export const organizationRouter = Router();

organizationRouter.get("/", requireAuth, listOrganizationsController);