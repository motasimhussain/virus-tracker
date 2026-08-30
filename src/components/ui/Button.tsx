import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "sm" | "md";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
  className?: string;
};

/** Renders an `<a>`/Next `<Link>` when `href` is provided, otherwise a `<button>`. */
export type ButtonProps =
  | (CommonProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">)
  | (CommonProps & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">);

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-slate-950 border border-transparent hover:bg-accent-strong",
  outline:
    "bg-transparent text-text-primary border border-border-default hover:border-border-accent hover:text-accent",
  ghost:
    "bg-transparent text-text-secondary border border-transparent hover:bg-surface-inset hover:text-text-primary",
};

const baseClasses =
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Shared button/link control. Pass `href` to render an internal Next `<Link>`
 * (or a plain `<a>` for external/absolute URLs), otherwise renders a
 * `<button type="button">`.
 */
export function Button({ variant = "primary", size = "md", className, children, ...rest }: ButtonProps) {
  const classes = cn(baseClasses, sizeClasses[size], variantClasses[variant], className);

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...anchorProps } = rest as CommonProps & { href: string } & Omit<
        AnchorHTMLAttributes<HTMLAnchorElement>,
        "href" | "className" | "children"
      >;
    const isExternal = /^([a-z][a-z0-9+.-]*:)?\/\//i.test(href) || href.startsWith("mailto:");

    if (isExternal) {
      return (
        <a href={href} className={classes} {...anchorProps}>
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = rest as CommonProps & { href?: undefined } & Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      "className" | "children"
    >;
  const { type = "button", ...restButtonProps } = buttonProps;

  return (
    <button type={type} className={classes} {...restButtonProps}>
      {children}
    </button>
  );
}
