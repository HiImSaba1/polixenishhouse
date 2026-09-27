import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Props = Omit<ComponentProps<typeof Link>, "children"> & { children: ReactNode; tone?: "ink" | "light" };

export function EditorialLink({ children, className = "", tone = "ink", ...props }: Props) {
  return <Link className={`editorial-link editorial-link--${tone} ${className}`} {...props}><span>{children}</span><svg viewBox="0 0 42 12" aria-hidden="true"><path d="M0 6h39M34 1l5 5-5 5" /></svg></Link>;
}
