import { randomUUID } from "node:crypto";
import * as argon2 from "argon2";
import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors/app-error.js";
import type { RegisterInput } from "./auth.schemas.js";
import { unknown } from "zod";

export class EmailAlreadyRegisteredError extends AppError {
  constructor() {
    super(
      409,
      "EMAIL_ALREADY_REGISTERED",
      "An account with this email already exists",
    );
  }
}

function createOrganizationSlug(name: string): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 26)
      .replace(/-+$/g, "") || "organization";

  return `${base}-${randomUUID()}`;
}

export async function register(input: RegisterInput) {
  const passwordHash = await argon2.hash(input.password, {
    type: argon2.argon2id,
  });
  
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email: input.email, passwordHash },
        select: { id: true, email: true },
      })
      .catch((error: unknown)=>{
        if(
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ){
          throw new EmailAlreadyRegisteredError();
        }

        throw error;
      })

      const organization = await tx.organization.create({
        data: {
          name: input.organizationName,
          slug: createOrganizationSlug(input.organizationName),
        },
        select: { id: true, name: true, slug: true },
      });

      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: "OWNER",
        },
        select: { id: true, role: true },
      });

      return { user, organization, membership };
    });
}