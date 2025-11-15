import { prisma } from "@/lib/prisma";

export const createUser = async (data: any) => {
  const newUser = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      emailVerified: data.emailVerified,
      password: data.password,
      role: data.role,
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
