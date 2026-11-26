import type { RequestHandler } from "express";
import { AuthenticationRequiredError } from "../../middleware/require-auth.js";
import { listOrganizationsForUser } from "./organization.service.js";

export const listOrganizationsController: RequestHandler = async (
  _req,
  res,
) => {
  const userId: unknown = res.locals.userId;

  if (typeof userId !== "string") {
    throw new AuthenticationRequiredError();
  }

  const organizations = await listOrganizationsForUser(userId);
  res.status(200).json({ organizations });
};