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
        <radialGradient id={`glow-${project.id}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.25" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <clipPath id={`c-${project.id}`}>
          <rect x="24" y="26" width="592" height="348" rx="14" />
        </clipPath>
      </defs>

      {/* desk background */}
      <rect width="640" height="400" fill="#09090B" />
      <g opacity="0.4">
        {Array.from({ length: 12 }).map((_, r) =>
          Array.from({ length: 20 }).map((__, c) => (
            <rect
              key={`grid-${r}-${c}`}
              x={c * 32 + 2}
              y={r * 33 + 2}
              width="24"
              height="24"
              fill={(r + c) % 2 === 0 ? '#111116' : '#0D0D11'}
            />
          )),
        )}
      </g>

      {/* ambient glow behind the window */}
      <ellipse cx="320" cy="120" rx="260" ry="140" fill={accent} opacity="0.08" />

      {/* browser window */}
      <rect x="24" y="26" width="592" height="348" rx="16" fill="#16161B" stroke="#2A2A33" strokeWidth="1" />
      <g clipPath={`url(#c-${project.id})`}>
        <rect x="24" y="26" width="592" height="348" rx="16" fill={`url(#g-${project.id})`} />

        {/* top glow */}
        <rect x="24" y="26" width="592" height="60" fill="url(#glow-${project.id})" />

        {/* chrome bar */}
        <rect x="24" y="26" width="592" height="40" fill="#0E0E12" />
        <circle cx="46" cy="46" r="5" fill="#FF5F57" />
        <circle cx="64" cy="46" r="5" fill="#FEBC2E" />
        <circle cx="82" cy="46" r="5" fill="#28C840" />
        <rect x="100" y="38" width="320" height="16" rx="8" fill="#1B1B22" />
        <rect x="100" y="38" width="160" height="16" rx="8" fill="#2A2A33" />
        <text
          x="114"
          y="51"
          fontFamily="JetBrains Mono, monospace"
          fontSize="10"
          fill="#8A8A9A"
        >
          {domain.slice(0, 34)}
        </text>
        <rect x="574" y="39" width="14" height="14" rx="3" fill={accent} />

        {/* page content differs per variant */}
        {variant === 0 && (
          <g>
            {/* header */}
            <rect x="24" y="72" width="592" height="44" fill="#0E0E12" opacity="0.8" />
            <rect x="44" y="82" width="80" height="10" rx="5" fill={accent} />
            <rect x="140" y="82" width="100" height="8" rx="4" fill="#FFFFFF" opacity="0.25" />
            <rect x="260" y="82" width="60" height="8" rx="4" fill="#FFFFFF" opacity="0.15" />
            <rect x="470" y="78" width="40" height="12" rx="6" fill="#3A3A46" />
            <rect x="520" y="78" width="40" height="12" rx="6" fill="#3A3A46" />
            <rect x="570" y="74" width="34" height="20" rx="10" fill={accent} />

            {/* hero title */}
            <text
              x="56"
              y="160"
              fontFamily="Space Grotesk, Arial"
              fontWeight="800"
              fontSize="36"
              fill="#FFFFFF"
            >
              {project.title.split(' ')[0]}
            </text>
            <rect x="56" y="176" width="260" height="12" rx="6" fill="#FFFFFF" opacity="0.4" />
            <rect x="56" y="200" width="200" height="10" rx="5" fill="#FFFFFF" opacity="0.25" />
            <rect x="56" y="224" width="130" height="38" rx="19" fill={accent} />
            <rect x="196" y="224" width="130" height="38" rx="19" fill="none" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="1.5" />

            {/* right side feature card */}
            <rect x="360" y="124" width="224" height="196" rx="14" fill="#0E0E12" opacity="0.85" />
            <rect x="380" y="144" width="84" height="56" rx="10" fill={accent} opacity="0.9" />
            <rect x="474" y="144" width="84" height="56" rx="10" fill="#FFFFFF" opacity="0.15" />
            <rect x="380" y="216" width="192" height="10" rx="5" fill="#FFFFFF" opacity="0.3" />
            <rect x="380" y="238" width="150" height="10" rx="5" fill="#FFFFFF" opacity="0.2" />
            <rect x="380" y="264" width="70" height="22" rx="11" fill={accent} opacity="0.75" />
          </g>
        )}

        {variant === 1 && (
          <g>
            {/* hero banner */}
            <rect x="24" y="72" width="592" height="104" fill="#0E0E12" opacity="0.75" />
            <rect x="48" y="94" width="200" height="16" rx="8" fill="#FFFFFF" opacity="0.95" />
            <rect x="48" y="120" width="320" height="12" rx="6" fill="#FFFFFF" opacity="0.45" />
            <rect x="48" y="140" width="250" height="10" rx="5" fill="#FFFFFF" opacity="0.3" />
            <rect x="470" y="90" width="112" height="48" rx="12" fill={accent} />

            {/* three feature cards */}
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${48 + i * 196}, 196)`}>
                <rect width="176" height="156" rx="14" fill="#0E0E12" opacity="0.85" />
                <rect x="16" y="18" width="48" height="48" rx="10" fill={i === 1 ? accent : mid} />
                <rect x="16" y="84" width="128" height="12" rx="6" fill="#FFFFFF" opacity="0.8" />
                <rect x="16" y="106" width="100" height="10" rx="5" fill="#FFFFFF" opacity="0.4" />
                <rect x="16" y="126" width="70" height="10" rx="5" fill={accent} opacity="0.85" />
              </g>
            ))}
          </g>
        )}

        {variant === 2 && (
          <g>
            {/* left sidebar */}
            <rect x="24" y="72" width="184" height="284" rx="14" fill="#0E0E12" opacity="0.85" />
            <rect x="48" y="96" width="96" height="14" rx="7" fill={accent} />
            {[0, 1, 2, 3, 4].map((i) => (
              <rect
                key={i}
                x="48"
                y={126 + i * 30}
                width={i === 2 ? 128 : 104}
                height="12"
                rx="6"
                fill="#FFFFFF"
                opacity={i === 2 ? 0.9 : 0.3}
              />
            ))}
            <rect x="48" y="304" width="132" height="44" rx="12" fill={accent} opacity="0.9" />

            {/* main content */}
            <text
              x="240"
              y="116"
              fontFamily="Space Grotesk, Arial"
              fontWeight="800"
              fontSize="32"
              fill="#FFFFFF"
            >
              {project.category}
            </text>
            <rect x="240" y="136" width="256" height="12" rx="6" fill="#FFFFFF" opacity="0.45" />
            <rect x="240" y="156" width="216" height="10" rx="5" fill="#FFFFFF" opacity="0.3" />

            <rect x="240" y="188" width="344" height="80" rx="14" fill="#0E0E12" opacity="0.8" />
            <rect x="260" y="208" width="148" height="36" rx="10" fill={accent} opacity="0.8" />
            <rect x="418" y="208" width="70" height="36" rx="10" fill="#FFFFFF" opacity="0.18" />
            <rect x="498" y="208" width="70" height="36" rx="10" fill="#FFFFFF" opacity="0.12" />

            <rect x="240" y="280" width="344" height="96" rx="14" fill="#0E0E12" opacity="0.75" />
            <rect x="260" y="300" width="320" height="12" rx="6" fill="#FFFFFF" opacity="0.4" />
            <rect x="260" y="322" width="280" height="10" rx="5" fill="#FFFFFF" opacity="0.25" />
            <rect x="260" y="344" width="192" height="10" rx="5" fill="#FFFFFF" opacity="0.15" />
          </g>
        )}
      </g>

      {/* pixel corner accents */}
      <rect x="24" y="26" width="16" height="16" fill={accent} />
      <rect x="600" y="360" width="16" height="16" fill={accent} />
      <rect x="40" y="360" width="12" height="12" fill="#FFFFFF" opacity="0.3" />
    </svg>
  );
}
