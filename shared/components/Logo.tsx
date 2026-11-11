interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  compact?: boolean;
}

/**
 * Duo Pixel Agency badge — the official circular logo (public/logo.jpg).
 */
export function LogoMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src="/logo.jpg"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="eager"
      className={`shrink-0 rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
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
