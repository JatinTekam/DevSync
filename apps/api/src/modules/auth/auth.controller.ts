import type { RequestHandler } from "express";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";
import { getCurrentUser, InvalidRefreshTokenError, login, logoutSession, REFRESH_TOKEN_TTL_MS, refreshSession, register } from "./auth.service.js";
import { env } from "../../config/env.js";
import type { Request,Response } from "express";
import { AuthenticationRequiredError } from "../../middleware/require-auth.js";

const refreshCookieName = "devsync_refresh";

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

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/v1/auth",
};

function readRefreshCookie(header: string | undefined): string | undefined {
  const prefix = `${refreshCookieName}=`;

  const entry = header
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  const value = entry?.slice(prefix.length);
  return value || undefined;
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(refreshCookieName, refreshCookieOptions);
}

export const refreshController: RequestHandler = async (req, res) => {
  const rawToken = readRefreshCookie(req.get("cookie"));

  if (!rawToken) {
    clearRefreshCookie(res);
    throw new InvalidRefreshTokenError();
  }

  try {
    const result = await refreshSession(rawToken);

    res.cookie(refreshCookieName, result.refreshToken, {
      ...refreshCookieOptions,
      maxAge: Math.max(0, result.expiresAt.getTime() - Date.now()),
    });

    res.status(200).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    if (error instanceof InvalidRefreshTokenError) {
      clearRefreshCookie(res);
    }
    throw error;
  }
};

export const logoutController: RequestHandler = async (req, res) => {
  try {
    await logoutSession(readRefreshCookie(req.get("cookie")));
  } finally {
    clearRefreshCookie(res);
  }

  res.status(204).end();
};

export const meController: RequestHandler = async (_req, res) => {
  const userId: unknown = res.locals.userId;

  if (typeof userId !== "string") {
    throw new AuthenticationRequiredError();
  }

  const user = await getCurrentUser(userId);

  if (!user) {
    throw new AuthenticationRequiredError();
  }

  res.status(200).json({ user });
};