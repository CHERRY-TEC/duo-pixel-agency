import type { Designer } from '../lib/types';

/**
 * Photo-style generated avatar — looks like a real portrait, no external image
 * requests. Built from the designer's photo_color palette.
 */
export default function Avatar({
  designer,
  size = 112,
  className = '',
}: {
  designer: Pick<Designer, 'name' | 'photo_color'>;
  size?: number;
  className?: string;
}) {
  const [a, b] = designer.photo_color;
  const initials = designer.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const id = `av-${designer.name.replace(/\W+/g, '')}`;
  const scale = size / 112;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={designer.name}
      className={className}
    >
      <defs>
        {/* face gradient — photo-like skin tone from palette */}
        <linearGradient id={`face-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={a} stopOpacity="0.9" />
          <stop offset="100%" stopColor={b} stopOpacity="0.8" />
        </linearGradient>
        {/* hair gradient */}
        <linearGradient id={`hair-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B0B0F" />
          <stop offset="100%" stopColor="#1A1A22" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect x="0" y="0" width="120" height="120" rx="26" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${id}-clip)`}>
        {/* background gradient */}
        <rect width="120" height="120" fill="#0E0E11" />
        <ellipse cx="60" cy="30" rx="50" ry="40" fill={a} opacity="0.25" />
        <ellipse cx="60" cy="90" rx="50" ry="35" fill={b} opacity="0.15" />

        {/* hair */}
        <path
          d="M 30 34 Q 60 20 90 34 Q 95 45 90 58 Q 95 70 82 76 Q 70 80 60 78 Q 50 80 38 76 Q 25 70 25 58 Q 30 45 30 34 Z"
          fill={`url(#hair-${id})`}
        />
        <path d="M 30 34 Q 60 18 90 34 L 90 58 L 30 58 Z" fill="#0B0B0F" opacity="0.6" />

        {/* face */}
        <ellipse cx="60" cy="56" rx="42" ry="48" fill={`url(#face-${id})`} />
        <ellipse cx="60" cy="56" rx="42" ry="48" fill="none" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1" />

        {/* eyes */}
        <ellipse cx="46" cy="48" rx="7" ry="4" fill="#0A0A0C" />
        <circle cx="46" cy="48" r="2" fill="#FFFFFF" opacity="0.9" />
        <ellipse cx="74" cy="48" rx="7" ry="4" fill="#0A0A0C" />
        <circle cx="74" cy="48" r="2" fill="#FFFFFF" opacity="0.9" />

        {/* nose */}
        <path d="M 56 56 L 60 64 L 64 56 Z" fill={b} opacity="0.7" />

        {/* mouth */}
        <path d="M 52 66 Q 60 70 68 66" fill="none" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="1.5" />

        {/* shoulders / clothing */}
        <rect x="20" y="86" width="80" height="34" fill="#16161B" />
        <rect x="20" y="86" width="80" height="12" fill={a} opacity="0.15" />
        <rect x="30" y="96" width="60" height="14" fill="#0E0E11" rx="4" />
        <rect x="46" y="98" width="28" height="10" fill={b} opacity="0.3" />

        {/* initials overlay */}
        <text
          x="60"
          y="74"
          textAnchor="middle"
          fontFamily="Space Grotesk, Arial, sans-serif"
          fontWeight="800"
          fontSize="22"
          fill="#FFFFFF"
          opacity="0.9"
        >
          {initials}
        </text>

        {/* shine highlight on face */}
        <ellipse cx="44" cy="44" rx="12" ry="8" fill="#FFFFFF" opacity="0.06" />

        {/* border */}
        <rect x="0" y="0" width="120" height="120" rx="26" fill="none" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="2" />
      </g>
    </svg>
  );
}
