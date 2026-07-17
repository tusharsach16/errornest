interface HamburgerIconProps {
  open: boolean;
}

export function HamburgerIcon({ open }: HamburgerIconProps) {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      {open ? (
        <>
          <line x1="4" y1="4" x2="20" y2="20" strokeLinecap="round" />
          <line x1="20" y1="4" x2="4" y2="20" strokeLinecap="round" />
        </>
      ) : (
        <>
          <line x1="4" y1="7" x2="20" y2="7" strokeLinecap="round" />
          <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round" />
          <line x1="4" y1="17" x2="20" y2="17" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
