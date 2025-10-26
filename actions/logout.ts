"use server";

import { signOut } from "@/auth";

export async function handleSignOut() {
  console.log("Signing out user...");
  await signOut();
}
