"use server";

import * as z from "zod";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { LoginSchema } from "@/schemas";
import { ADMIN_LOGIN_REDIRECT, DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { getUserByEmail } from "@/services/user";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;

  // Only admins have anywhere to go but the site. This runs before the
  // password is checked, but it only picks the destination after a success.
  const user = await getUserByEmail(email);
  const redirectTo =
    user?.role === "ADMIN" ? ADMIN_LOGIN_REDIRECT : DEFAULT_LOGIN_REDIRECT;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }

    throw error;
  }
};
