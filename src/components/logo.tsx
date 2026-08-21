export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Splizo logo"
    >
      <defs>
        <linearGradient id="splizo-grad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2DD4BF" />
          <stop offset="1" stopColor="#0D9488" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="20" r="13" fill="url(#splizo-grad)" fillOpacity="0.9" />
      <circle cx="24" cy="20" r="13" fill="url(#splizo-grad)" fillOpacity="0.55" />
      <path
        d="M10 24 L17 16 L22 21 L30 11"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="30" cy="11" r="2.4" fill="white" />
    </svg>
  );
}

export function Logo({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark size={size} />
      <span className="text-lg font-semibold tracking-tight">Splizo</span>
    </span>
  );
}
