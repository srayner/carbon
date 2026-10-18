import { NextResponse } from "next/server";
import type { Prisma } from "@/lib/generated/prisma";

const isDev = process.env.NODE_ENV === "development";

export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const isPrismaRequestError = (
  err: unknown
): err is Prisma.PrismaClientKnownRequestError =>
  typeof err === "object" &&
  err !== null &&
  "code" in err &&
  typeof (err as { code: unknown }).code === "string" &&
  /^P\d{4}$/.test((err as { code: string }).code);

export const handleAppError = (err: unknown) => {
  // Handle our own application errors
  if (err instanceof AppError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }

  // Handle Prisma-specific errors. Checked by error code rather than with
  // instanceof, which doesn't hold across Next's separately bundled routes.
  if (isPrismaRequestError(err)) {
    if (err.code === "P2025") {
      console.log(err.meta);
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "A page with this slug already exists." },
        { status: 409 }
      );
    }
    if (err.code === "P2003") {
      return NextResponse.json(
        { error: "Foreign key constraint failed" },
        { status: 400 }
      );
    }
  }

  console.error("Unexpected error:", err);

  return NextResponse.json(
    {
      error:
        isDev && err instanceof Error ? err.message : "Internal Server Error",
    },
    { status: 500 }
  );
};
