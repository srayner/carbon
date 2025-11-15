import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/generated/prisma";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.date().optional(),
  password: z.string().min(8), // example: enforce min length
  role: z.nativeEnum(UserRole).optional(), // optional, default USER
});

export const createUser = async (data: unknown) => {
  const validatedData = createUserSchema.parse(data);

  const newUser = await prisma.user.create({
    data: {
      name: validatedData.name,
      email: validatedData.email,
      emailVerified: validatedData.emailVerified,
      password: validatedData.password,
      role: validatedData.role,
    },
  });

  return newUser;
};

export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string | undefined) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user;
  } catch {
    return null;
  }
};
