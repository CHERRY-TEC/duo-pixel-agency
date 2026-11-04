import type { Designer } from '../lib/types';

/**
 * Generated avatar — a pixel-styled portrait built from the designer's
 * palette. No external image requests, so it loads instantly on mobile.
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
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={a} />
          <stop offset="100%" stopColor={b} />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect x="0" y="0" width="120" height="120" rx="26" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect width="120" height="120" fill="#0E0E11" />
        <g opacity="0.18">
          {Array.from({ length: 8 }).map((_, r) =>
            Array.from({ length: 8 }).map((__, c) => (
              <rect
                key={`${r}-${c}`}
                x={c * 15}
                y={r * 15}
                width="15"
                height="15"
                fill={(r + c) % 2 === 0 ? a : '#FFFFFF'}
              />
            )),
          )}
        </g>
        <rect x="14" y="14" width="92" height="92" rx="22" fill={`url(#${id})`} opacity="0.16" />
        <rect x="26" y="34" width="68" height="68" rx="18" fill={`url(#${id})`} opacity="0.32" />
        <rect x="26" y="24" width="34" height="34" rx="7" fill={a} />
        <text
          x="60"
          y="82"
          textAnchor="middle"
          fontFamily="Space Grotesk, Arial, sans-serif"
          fontWeight="700"
          fontSize="40"
          fill="#FFFFFF"
        >
          {initials}
        </text>
        <rect x="0" y="0" width="120" height="120" rx="26" fill="none" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="2" />
      </g>
    </svg>
  );
}
