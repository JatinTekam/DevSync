import type { RequestHandler } from "express";
import type { RegisterInput } from "./auth.schemas.js";
import { register } from "./auth.service.js";

export const registerController: RequestHandler<
  Record<string, string>,
  unknown,
  RegisterInput
> = async (req, res) => {
  const result = await register(req.body);
  res.status(201).json(result);
};