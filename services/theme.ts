import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api/error";
import { Prisma } from "@/lib/generated/prisma";
import { Theme, themeSchema, withDefaults } from "@/lib/theme";

const THEME_ID = "site";

/** The site theme; the defaults until one has been saved. */
export const getTheme = async (): Promise<Theme> => {
  const row = await prisma.siteTheme.findUnique({ where: { id: THEME_ID } });
  return withDefaults(row?.values);
};

export const saveTheme = async (data: unknown): Promise<Theme> => {
  const parsed = themeSchema.safeParse(data);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new AppError(
      `${issue.path.join(" › ") || "Theme"}: ${issue.message}`,
      400
    );
  }

  const values = parsed.data as unknown as Prisma.InputJsonValue;
  await prisma.siteTheme.upsert({
    where: { id: THEME_ID },
    create: { id: THEME_ID, values },
    update: { values },
  });
  return getTheme();
};
