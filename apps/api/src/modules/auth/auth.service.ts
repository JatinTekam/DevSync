import * as argon2 from "argon2";
import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../shared/errors/app-error.js";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { SignJWT } from "jose";
import { env } from "../../config/env.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";

export class EmailAlreadyRegisteredError extends AppError {
  constructor() {
    super(
      409,
      "EMAIL_ALREADY_REGISTERED",
      "An account with this email already exists",
    );
  }
}



export class InvalidCredentialsError extends AppError {
  constructor() {
    super(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
  }
}

export class InvalidRefreshTokenError extends AppError {
  constructor() {
    super(401, "INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired");
  }
}

export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

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

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, email: true, passwordHash: true },
  });

  if (!user || !(await argon2.verify(user.passwordHash, input.password))) {
    throw new InvalidCredentialsError();
  }

  const refreshToken = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await prisma.refreshToken.create({
    data: {
      tokenHash: createHash("sha256").update(refreshToken).digest("hex"),
      familyId: randomUUID(),
      userId: user.id,
      expiresAt,
    },
  });

  return {
    user: { id: user.id, email: user.email },
    accessToken: await createAccessToken(user.id),
    refreshToken,
  };
}


async function createAccessToken(userId: string): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("devsync-api")
    .setAudience("devsync-web")
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
}

export async function refreshSession(rawToken: string) {
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");

  const result = await prisma.$transaction(async (tx) => {
    const current = await tx.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!current) {
      return { ok: false as const };
    }

    const now = new Date();

    if (current.revokedAt || current.expiresAt <= now) {
      await tx.refreshToken.updateMany({
        where: { familyId: current.familyId, revokedAt: null },
        data: { revokedAt: now },
      });
      return { ok: false as const };
    }

    const claimed = await tx.refreshToken.updateMany({
      where: { id: current.id, revokedAt: null },
      data: { revokedAt: now },
    });

    if (claimed.count !== 1) {
      await tx.refreshToken.updateMany({
        where: { familyId: current.familyId, revokedAt: null },
        data: { revokedAt: now },
      });
      return { ok: false as const };
    }

    const user = await tx.user.findUnique({
      where: { id: current.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      await tx.refreshToken.updateMany({
        where: { familyId: current.familyId, revokedAt: null },
        data: { revokedAt: now },
      });
      return { ok: false as const };
    }

    const nextRefreshToken = randomBytes(32).toString("base64url");

    await tx.refreshToken.create({
      data: {
        tokenHash: createHash("sha256")
          .update(nextRefreshToken)
          .digest("hex"),
        familyId: current.familyId,
        userId: current.userId,
        expiresAt: current.expiresAt,
      },
    });

    return {
      ok: true as const,
      user,
      accessToken: await createAccessToken(user.id),
      refreshToken: nextRefreshToken,
      expiresAt: current.expiresAt,
    };
  });

  if (!result.ok) {
    throw new InvalidRefreshTokenError();
  }

  return {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    expiresAt: result.expiresAt,
  };
}