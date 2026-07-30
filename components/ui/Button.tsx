import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent hover:opacity-90",
  secondary: "border border-border bg-surface/40 text-text hover:bg-surface",
  danger: "bg-error text-white hover:opacity-90",
  ghost: "text-dim hover:text-text",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
};

/** The one Button every RDIOS screen should render — Implementation
 *  Sprint 2 §7. Four roles, not a free choice of color per screen: primary
 *  for the one decisive action per view, secondary for an ordinary
 *  alternative, danger for the rare irreversible action (paired with a
 *  dialog, never a drawer, per the Visual Design System), ghost for a
 *  quiet, low-emphasis control. Motion, radius, and disabled treatment are
 *  identical everywhere this is used, so a button never looks like it
 *  wandered in from a different product. */
export function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`rounded-xl font-medium transition-opacity duration-fast ease-os-out disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`}
      {...props}
    />
  );
}
