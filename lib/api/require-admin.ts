import { auth } from "@/auth";
import { AppError } from "./error";

/**
 * Throws an AppError unless the current session belongs to an admin.
 * 401 when not logged in, 403 when logged in without the ADMIN role.
 */
export const requireAdmin = async () => {
  const session = await auth();

  if (!session?.user) {
    throw new AppError("Unauthorized", 401);
  }

  if (session.user.role !== "ADMIN") {
    throw new AppError("Forbidden", 403);
  }

  return session;
};
