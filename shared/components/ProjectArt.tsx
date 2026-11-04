import type { Project } from '../lib/types';

/**
 * Procedurally drawn "screenshot" for each portfolio piece.
 * Deterministic per project id — no external images, always crisp.
 */
export default function ProjectArt({
  project,
  className = '',
}: {
  project: Project;
  className?: string;
}) {
  const [bg, accent, mid] = project.palette;
  const seedNum = project.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const variant = seedNum % 3;
  const domain = project.live_url.replace(/^https?:\/\//, '');

  return (
    <svg
      viewBox="0 0 640 400"
      className={className}
      role="img"
      aria-label={`${project.title} website preview`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`g-${project.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={mid} />
          <stop offset="100%" stopColor={bg} />
        </linearGradient>
        <clipPath id={`c-${project.id}`}>
          <rect x="24" y="26" width="592" height="348" rx="14" />
        </clipPath>
      </defs>

      {/* desk background */}
      <rect width="640" height="400" fill="#0A0A0C" />
      <g opacity="0.5">
        {Array.from({ length: 10 }).map((_, r) =>
          Array.from({ length: 16 }).map((__, c) => (
            <rect
              key={`grid-${r}-${c}`}
              x={c * 40 + 4}
              y={r * 40 + 4}
              width="32"
              height="32"
              fill={(r + c) % 2 === 0 ? '#111116' : '#0D0D11'}
            />
          )),
        )}
      </g>

      {/* browser window */}
      <rect x="24" y="26" width="592" height="348" rx="14" fill="#14141A" stroke="#2A2A33" />
      <g clipPath={`url(#c-${project.id})`}>
        <rect x="24" y="26" width="592" height="348" fill={`url(#g-${project.id})`} />

        {/* chrome bar */}
        <rect x="24" y="26" width="592" height="34" fill="#0E0E12" />
        <circle cx="46" cy="43" r="5" fill="#FF5F57" />
        <circle cx="64" cy="43" r="5" fill="#FEBC2E" />
        <circle cx="82" cy="43" r="5" fill="#28C840" />
        <rect x="100" y="34" width="300" height="18" rx="9" fill="#1B1B22" />
        <text
          x="114"
          y="47"
          fontFamily="JetBrains Mono, monospace"
          fontSize="10"
          fill="#7A7A8A"
        >
          {domain.slice(0, 34)}
        </text>
        <rect x="574" y="36" width="14" height="14" rx="3" fill={accent} />

        {/* page content differs per variant */}
        {variant === 0 && (
          <g>
            <rect x="24" y="60" width="592" height="30" fill="#0E0E12" opacity="0.75" />
            <rect x="44" y="70" width="70" height="10" rx="5" fill={accent} />
            <rect x="470" y="70" width="40" height="8" rx="4" fill="#3A3A46" />
            <rect x="520" y="70" width="40" height="8" rx="4" fill="#3A3A46" />
            <rect x="570" y="66" width="34" height="16" rx="8" fill={accent} />

            <text
              x="56"
              y="152"
              fontFamily="Space Grotesk, Arial"
              fontWeight="700"
              fontSize="34"
              fill="#FFFFFF"
            >
              {project.title.split(' ')[0]}
            </text>
            <rect x="56" y="168" width="250" height="12" rx="6" fill="#FFFFFF" opacity="0.35" />
            <rect x="56" y="190" width="200" height="12" rx="6" fill="#FFFFFF" opacity="0.2" />
            <rect x="56" y="222" width="120" height="34" rx="17" fill={accent} />
            <rect x="188" y="222" width="120" height="34" rx="17" fill="none" stroke="#FFFFFF" strokeOpacity="0.4" />

            <rect x="356" y="120" width="230" height="176" rx="12" fill="#0E0E12" opacity="0.85" />
            <rect x="376" y="140" width="90" height="60" rx="8" fill={accent} opacity="0.85" />
            <rect x="478" y="140" width="90" height="60" rx="8" fill="#FFFFFF" opacity="0.18" />
            <rect x="376" y="214" width="192" height="12" rx="6" fill="#FFFFFF" opacity="0.3" />
            <rect x="376" y="236" width="150" height="12" rx="6" fill="#FFFFFF" opacity="0.18" />
            <rect x="376" y="264" width="70" height="20" rx="6" fill={accent} opacity="0.7" />
          </g>
        )}

        {variant === 1 && (
          <g>
            <rect x="24" y="60" width="592" height="96" fill="#0E0E12" opacity="0.7" />
            <rect x="48" y="82" width="180" height="14" rx="7" fill="#FFFFFF" opacity="0.9" />
            <rect x="48" y="106" width="300" height="10" rx="5" fill="#FFFFFF" opacity="0.4" />
            <rect x="48" y="124" width="240" height="10" rx="5" fill="#FFFFFF" opacity="0.25" />
            <rect x="470" y="86" width="120" height="44" rx="10" fill={accent} />

            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${48 + i * 190}, 176)`}>
                <rect width="170" height="140" rx="12" fill="#0E0E12" opacity="0.85" />
                <rect x="16" y="18" width="44" height="44" rx="8" fill={i === 1 ? accent : mid} />
                <rect x="16" y="76" width="120" height="10" rx="5" fill="#FFFFFF" opacity="0.75" />
                <rect x="16" y="94" width="94" height="10" rx="5" fill="#FFFFFF" opacity="0.3" />
                <rect x="16" y="114" width="60" height="10" rx="5" fill={accent} opacity="0.8" />
              </g>
            ))}
          </g>
        )}

        {variant === 2 && (
          <g>
            <rect x="24" y="60" width="180" height="304" fill="#0E0E12" opacity="0.85" />
            <rect x="48" y="84" width="90" height="12" rx="6" fill={accent} />
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x="48" y={116 + i * 28} width={i === 2 ? 120 : 100} height="10" rx="5" fill="#FFFFFF" opacity={i === 2 ? 0.8 : 0.28} />
            ))}
            <rect x="48" y="300" width="128" height="40" rx="10" fill={accent} opacity="0.9" />

            <text
              x="234"
              y="112"
              fontFamily="Space Grotesk, Arial"
              fontWeight="700"
              fontSize="30"
              fill="#FFFFFF"
            >
              {project.category}
            </text>
            <rect x="234" y="132" width="240" height="10" rx="5" fill="#FFFFFF" opacity="0.4" />
            <rect x="234" y="150" width="200" height="10" rx="5" fill="#FFFFFF" opacity="0.25" />

            <rect x="234" y="182" width="354" height="72" rx="12" fill="#0E0E12" opacity="0.8" />
            <rect x="254" y="202" width="140" height="32" rx="8" fill={accent} opacity="0.75" />
            <rect x="414" y="202" width="70" height="32" rx="8" fill="#FFFFFF" opacity="0.2" />
            <rect x="500" y="202" width="70" height="32" rx="8" fill="#FFFFFF" opacity="0.12" />

            <rect x="234" y="274" width="354" height="90" rx="12" fill="#0E0E12" opacity="0.7" />
            <rect x="254" y="294" width="314" height="10" rx="5" fill="#FFFFFF" opacity="0.35" />
            <rect x="254" y="314" width="270" height="10" rx="5" fill="#FFFFFF" opacity="0.22" />
            <rect x="254" y="334" width="180" height="10" rx="5" fill="#FFFFFF" opacity="0.14" />
          </g>
        )}
      </g>

      {/* pixel corner accents */}
      <rect x="24" y="26" width="14" height="14" fill={accent} />
      <rect x="602" y="360" width="14" height="14" fill={accent} />
    </svg>
  );
}
