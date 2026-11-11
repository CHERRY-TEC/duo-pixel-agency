interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  compact?: boolean;
}

/**
 * Duo Pixel Agency badge — the official circular logo (public/logo.jpg).
 * Wrapped in a soft accent ring + glow so it reads clearly on the dark theme.
 */
export function LogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full ring-1 ring-accent/40 shadow-[0_0_20px_rgba(185,255,57,0.22),0_6px_18px_rgba(0,0,0,0.5)] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img
        src="/logo.jpg"
        alt=""
        loading="eager"
        width={size}
        height={size}
        className="h-full w-full rounded-full object-cover"
      />
    </span>
  );
}

export default function Logo({ size = 40, showWordmark = true, className = '', compact = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark size={size} />
      {showWordmark && (
        <span className="font-display text-[19px] font-bold leading-none tracking-tight text-white sm:text-[21px]">
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
