import { prisma } from "../../db/prisma.js";

export async function listOrganizationsForUser(userId: string) {
  return prisma.membership.findMany({
    where: { userId },
    select: {
      role: true,
      organization: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}