interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  compact?: boolean;
}

/**
 * Duo Pixel Agency wordmark — two overlapping pixel squares + type.
 * The same shape is used for the favicon (public/favicon.svg).
 */
export function LogoMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect x="4" y="4" width="24" height="24" rx="3" fill="#B9FF39" />
      <rect x="20" y="20" width="24" height="24" rx="3" fill="#FFFFFF" />
      <rect x="20" y="20" width="8" height="8" fill="#B9FF39" />
      <rect x="32" y="32" width="6" height="6" fill="#0A0A0C" />
    </svg>
  );
}

export default function Logo({ size = 30, showWordmark = true, className = '', compact = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {showWordmark && (
        <span className="font-display text-[17px] font-bold leading-none tracking-tight text-white">
          {compact ? (
            <>
              Duo<span className="text-accent">Pixel</span>
            </>
          ) : (
            <>
              Duo Pixel <span className="text-accent">Agency</span>
            </>
          )}
        </span>
      )}
    </span>
  );
}
