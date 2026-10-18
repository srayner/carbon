import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { handleAppError, AppError } from "@/lib/api/error";
import { requireAdmin } from "@/lib/api/require-admin";
import {
  ALLOWED_EXTENSIONS,
  MAX_UPLOAD_BYTES,
  UPLOAD_DIR,
  isImageExtension,
  makeStoredName,
} from "@/lib/uploads";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      throw new AppError("No file was uploaded.", 400);
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new AppError(`Files of type "${ext || "unknown"}" are not allowed.`, 400);
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new AppError(
        `File is too large (limit ${MAX_UPLOAD_BYTES / 1024 / 1024} MB).`,
        413
      );
    }

    const storedName = makeStoredName(file.name);
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(
      path.join(UPLOAD_DIR, storedName),
      Buffer.from(await file.arrayBuffer())
    );

    return NextResponse.json(
      {
        url: `/files/${storedName}`,
        name: file.name,
        size: file.size,
        isImage: isImageExtension(ext),
      },
      { status: 201 }
    );
  } catch (err) {
    return handleAppError(err);
  }
}
