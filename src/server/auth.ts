import "server-only";
import { db } from "@/server/db";
import { cache } from "react";

export type AppSession = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
};

const DEFAULT_LOCAL_USER_EMAIL = process.env.LOCAL_USER_EMAIL ?? "local@allweone.app";
const DEFAULT_LOCAL_USER_NAME = process.env.LOCAL_USER_NAME ?? "Local Workspace";

const syncAppUser = cache(async (): Promise<AppSession> => {
  let user = await db.user.findUnique({
    where: { email: DEFAULT_LOCAL_USER_EMAIL },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        email: DEFAULT_LOCAL_USER_EMAIL,
        hasAccess: true,
        name: DEFAULT_LOCAL_USER_NAME,
        role: "ADMIN",
      },
    });
  }

  if (!user.hasAccess || user.name !== DEFAULT_LOCAL_USER_NAME) {
    user = await db.user.update({
      where: { id: user.id },
      data: {
        hasAccess: true,
        name: DEFAULT_LOCAL_USER_NAME,
      },
    });
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
});

export async function auth() {
  return syncAppUser();
}
