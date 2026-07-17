import type { SVGProps } from "react";

export function MiniSpinner({
  className = "h-3 w-3",
  strokeWidth = 2,
  ...props
}: {
  className?: string;
  strokeWidth?: number;
} & Omit<SVGProps<SVGSVGElement>, "strokeWidth">) {
  return (
    <svg
      aria-hidden="true"
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3a9 9 0 0 1 9 9"
        className="opacity-25"
      />
      <circle cx="12" cy="12" r="9" strokeOpacity={0.25} />
    </svg>
  );
}
