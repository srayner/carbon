/*
 * Which files can be uploaded, and the type each is served as. No server-only
 * imports, so the upload field in the browser can share the list.
 */

// SVG can carry scripts. Shown through <img> they don't run, but opening an
// uploaded SVG's address directly would run them as this site. Accepted while
// there is one author; see "Fix soon" in docs/plans/03-backlog.md.
export const IMAGE_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

// Everything else is only ever served as a download.
export const FILE_TYPES: Record<string, string> = {
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

/** For a file input's accept attribute, e.g. ".png,.jpg,...". */
export const IMAGE_ACCEPT = Object.keys(IMAGE_TYPES).join(",");
