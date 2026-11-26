import type { RequestHandler } from "express";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";
import { login, REFRESH_TOKEN_TTL_MS, register } from "./auth.service.js";
import { env } from "../../config/env.js";

export const registerController: RequestHandler<
  Record<string, string>,
  unknown,
  RegisterInput
> = async (req, res) => {
  const result = await register(req.body);
  res.status(201).json(result);
};

export const loginController: RequestHandler<
  Record<string, string>,
  unknown,
  LoginInput
> = async (req, res) => {
  const { user, accessToken, refreshToken } = await login(req.body);

  res.cookie("devsync_refresh", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/auth",
    maxAge: REFRESH_TOKEN_TTL_MS,
  });

  res.status(200).json({ user, accessToken });
};