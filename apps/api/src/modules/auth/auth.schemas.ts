import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  password: z.string().min(12).max(128),
  organizationName: z.string().trim().min(2).max(120),
});

export type RegisterInput = z.infer<typeof registerSchema>;