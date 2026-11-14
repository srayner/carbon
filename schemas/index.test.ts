import { describe, expect, it } from "vitest";
import { LoginSchema, RegisterSchema } from "@/schemas";

// The message the form shows under each field, keyed by field name
const messages = (result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) =>
  Object.fromEntries((result.error?.issues ?? []).map((i) => [String(i.path[0]), i.message]));

const login = { email: "ada@example.com", password: "x" };
const register = { email: "ada@example.com", password: "secret", name: "Ada" };

describe("LoginSchema", () => {
  it("accepts a valid login", () => {
    expect(LoginSchema.safeParse(login)).toMatchObject({ success: true, data: login });
  });

  // Each bad field shows its own message, and no other field complains
  it.each([
    ["an empty email", { email: "" }, { email: "Email is required" }],
    ["an email with no @", { email: "ada.example.com" }, { email: "Email is required" }],
    ["an empty password", { password: "" }, { password: "Password is required" }],
    ["both empty", { email: "", password: "" }, { email: "Email is required", password: "Password is required" }],
  ])("rejects %s", (_, change, expected) => {
    const result = LoginSchema.safeParse({ ...login, ...change });
    expect(result.success).toBe(false);
    expect(messages(result)).toEqual(expected);
  });
});

describe("RegisterSchema", () => {
  it("accepts a valid registration, including a 6 character password", () => {
    expect(RegisterSchema.safeParse(register)).toMatchObject({ success: true, data: register });
  });

  it.each([
    ["an empty email", { email: "" }, { email: "Email is required" }],
    ["an email with no domain", { email: "ada@" }, { email: "Email is required" }],
    ["a 5 character password", { password: "12345" }, { password: "Minimum 6 characters required" }],
    ["an empty name", { name: "" }, { name: "Name is required" }],
  ])("rejects %s", (_, change, expected) => {
    const result = RegisterSchema.safeParse({ ...register, ...change });
    expect(result.success).toBe(false);
    expect(messages(result)).toEqual(expected);
  });
});
