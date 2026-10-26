"use server";

import { signOut } from "@/auth";

export async function handleSignOut() {
  console.log("Signing out user...");
  // Without a destination Auth.js reloads the current page, which is a 404 for
  // a visitor who has just left the admin area
  await signOut({ redirectTo: "/auth/login" });
}
