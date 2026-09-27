import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { hasAdminSession } from "@/features/admin/auth";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  if (await hasAdminSession()) redirect("/admin");
  return <main className="admin-login"><div><span className="eyebrow">Private administration</span><h1>Polixeni’s House</h1><p>Sign in to manage calendar rules and reservation requests.</p><LoginForm /></div></main>;
}
