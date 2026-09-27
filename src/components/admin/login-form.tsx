"use client";

import { useActionState } from "react";
import { loginAction } from "@/features/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { error: null });
  return <form className="admin-login__form" action={action}>
    <label><span>Username</span><input name="username" type="text" autoComplete="username" required /></label>
    <label><span>Password</span><input name="password" type="password" autoComplete="current-password" required /></label>
    {state.error ? <p role="alert">{state.error}</p> : null}
    <button type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
  </form>;
}
