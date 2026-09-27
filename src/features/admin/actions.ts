"use server";

import { redirect } from "next/navigation";
import { createAdminSession, destroyAdminSession, verifyAdminCredentials } from "./auth";

export type LoginState = { error: string | null };

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const username = formData.get("username");
  const password = formData.get("password");
  if (typeof username !== "string" || username.length < 1) return { error: "Enter the administrator username." };
  if (typeof password !== "string" || password.length < 1) return { error: "Enter the administrator password." };
  try {
    if (!verifyAdminCredentials(username, password)) return { error: "The username or password is not correct." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Administrator authentication is not configured." };
  }
  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}
