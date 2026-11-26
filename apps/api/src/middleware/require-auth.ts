import type { RequestHandler } from "express";
import { errors, jwtVerify } from "jose";
import { z } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../shared/errors/app-error.js";

export class AuthenticationRequiredError extends AppError {
  constructor() {
    super(401, "AUTHENTICATION_REQUIRED", "Authentication is required");
  }
}

const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const userIdSchema = z.string().uuid();

export const requireAuth: RequestHandler = async (req, res, next) => {
  const match = /^Bearer\s+([^\s]+)$/i.exec(req.get("authorization") ?? "");
  const token = match?.[1];

  if (!token) {
    next(new AuthenticationRequiredError());
    return;
  }

  let payload;

  try {
    ({ payload } = await jwtVerify(token, secret, {
      issuer: "devsync-api",
      audience: "devsync-web",
      algorithms: ["HS256"],
    }));
  } catch (error) {
    if (error instanceof errors.JOSEError) {
      next(new AuthenticationRequiredError());
    } else {
      next(error);
    }
    return;
  }

  if (
    typeof payload.sub !== "string" ||
    !userIdSchema.safeParse(payload.sub).success
  ) {
    next(new AuthenticationRequiredError());
    return;
  }

  res.locals.userId = payload.sub;
  next();
};