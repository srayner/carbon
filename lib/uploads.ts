import path from "path";
import { randomBytes } from "crypto";

// Where uploaded files are stored. Mount a persistent volume here in production.
export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "./uploads");

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

// SVG is deliberately left out: it can carry scripts.
const IMAGE_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

// Everything else is only ever served as a download.
const FILE_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".stl": "model/stl",
  ".3mf": "model/3mf",
  ".step": "application/octet-stream",
  ".stp": "application/octet-stream",
  ".obj": "model/obj",
  ".zip": "application/zip",
  ".7z": "application/x-7z-compressed",
  ".gz": "application/gzip",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".csv": "text/csv",
  ".json": "application/json",
  ".ino": "text/plain",
  ".py": "text/plain",
  ".c": "text/plain",
  ".h": "text/plain",
  ".cpp": "text/plain",
  ".kicad_sch": "text/plain",
  ".kicad_pcb": "text/plain",
  ".sch": "text/plain",
  ".brd": "text/plain",
  ".gbr": "text/plain",
};

export const isImageExtension = (ext: string) => ext in IMAGE_TYPES;

export const getContentType = (ext: string): string | null =>
  IMAGE_TYPES[ext] ?? FILE_TYPES[ext] ?? null;

export const ALLOWED_EXTENSIONS = [
  ...Object.keys(IMAGE_TYPES),
  ...Object.keys(FILE_TYPES),
];

/**
 * A safe, unique name for a stored file: random prefix plus a cleaned-up
 * version of the original name, so downloads keep a readable filename.
 */
export const makeStoredName = (originalName: string) => {
  const ext = path.extname(originalName).toLowerCase();
  const base = path
    .basename(originalName, path.extname(originalName))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${randomBytes(6).toString("hex")}-${base || "file"}${ext}`;
};

// What a stored name can look like: nothing that could escape UPLOAD_DIR
export const STORED_NAME_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;
