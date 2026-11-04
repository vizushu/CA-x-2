// CA Double tab icon: a surfboard crossed over a snowboard. Each board lights up for its mode.
import React from 'react';

const SURF = 'M -10.6 0.3 C -10.9 -0.6 -10.3 -1.2 -9.2 -1.5 C -3.5 -2.7 4.5 -2.1 11 0 C 4.5 2.1 -3.5 2.7 -9.2 1.5 C -9.9 1.3 -10.4 0.9 -10.6 0.3 Z';
const SNOW = 'M -7.4 -2.9 C -4 -2.9 -3 -1.9 0 -1.9 C 3 -1.9 4 -2.9 7.4 -2.9 A 2.9 2.9 0 0 1 7.4 2.9 C 4 2.9 3 1.9 0 1.9 C -3 1.9 -4 2.9 -7.4 2.9 A 2.9 2.9 0 0 1 -7.4 -2.9 Z';

/** mode: 'surf' | 'double' | 'snow' — which board is lit. */
export default function BoardsX({ mode, size = 28 }) {
  const id = React.useId().replace(/:/g, '');
  const lit = { surf: 'var(--acc, oklch(0.84 0.12 195))', double: null, snow: 'var(--t1, #0C1621)' }[mode];
  const surfFill = mode === 'double' ? 'oklch(0.8 0.1 190)' : mode === 'surf' ? lit : '#FFFFFF';
  const snowFill = mode === 'double' ? 'oklch(0.93 0.03 240)' : mode === 'snow' ? lit : 'var(--t3, #74808E)';
  const surfDim = mode === 'snow', snowDim = mode === 'surf';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="-2" y="-2" width="28" height="28">
          <rect x="-2" y="-2" width="28" height="28" fill="#fff" />
          {/* gap where the surfboard crosses, plus binding slots */}
          <path d={SURF} transform="translate(12 12) rotate(-45) scale(1.12)" fill="#000" stroke="#000" strokeWidth="1.5" />
          <g transform="translate(12 12) rotate(45) scale(1.12)" fill="#000">
            <rect x="-6.6" y="-1.25" width="0.95" height="2.5" rx="0.47" />
            <rect x="5.65" y="-1.25" width="0.95" height="2.5" rx="0.47" />
          </g>
        </mask>
      </defs>
      <g mask={`url(#${id})`}>
        <path d={SNOW} transform="translate(12 12) rotate(45) scale(1.12)" style={{ fill: snowFill, opacity: snowDim ? 0.45 : 1, transition: 'fill .25s, opacity .25s' }} />
      </g>
      <path d={SURF} transform="translate(12 12) rotate(-45) scale(1.12)" style={{ fill: surfFill, stroke: surfDim ? 'var(--t3, #566371)' : 'none', strokeWidth: 0.5, strokeOpacity: 0.55, transition: 'fill .25s' }} />
    </svg>
  );
}
