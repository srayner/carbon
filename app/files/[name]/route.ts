import { NextRequest, NextResponse } from "next/server";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import {
  STORED_NAME_PATTERN,
  UPLOAD_DIR,
  getContentType,
  isImageExtension,
} from "@/lib/uploads";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const ext = path.extname(name).toLowerCase();
  const contentType = getContentType(ext);

  if (!STORED_NAME_PATTERN.test(name) || !contentType) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(UPLOAD_DIR, name);
  const info = await stat(filePath).catch(() => null);
  if (!info?.isFile()) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Strip the random prefix to give downloads their readable filename
  const downloadName = name.replace(/^[a-f0-9]{12}-/, "");
  const isImage = isImageExtension(ext);

  return new NextResponse(
    Readable.toWeb(createReadStream(filePath)) as ReadableStream,
    {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(info.size),
        "Content-Disposition": `${isImage ? "inline" : "attachment"}; filename="${downloadName}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    }
  );
}
