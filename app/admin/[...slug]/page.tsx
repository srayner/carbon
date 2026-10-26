import { notFound } from "next/navigation";

// Any /admin URL that no other route matches. Rendering it inside the admin
// layout means the 404 gets the admin chrome (see ../not-found.tsx) instead
// of the public site's.
export default function AdminCatchAll() {
  return notFound();
}
