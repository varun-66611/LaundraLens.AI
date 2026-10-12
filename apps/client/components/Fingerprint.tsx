import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import type { Candidate } from '../lib/types';

const axes = [
  ['Structural', 'structuralComplexity', 0, -1],
  ['Temporal', 'temporalUnusualness', 1, 0],
  ['Density', 'relationshipDensity', 0, 1],
  ['Flow', 'flowConcentration', -1, 0],
] as const;

export function Fingerprint({ candidate, size = 210 }: { candidate: Candidate; size?: number }) {
  const c = size / 2;
  const radius = size * 0.31;
  const points = axes.map(([, key, dx, dy]) => {
    const distance = radius * candidate.fingerprint[key] / 100;
    return `${c + dx * distance},${c + dy * distance}`;
  }).join(' ');
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} accessibilityLabel={`Network fingerprint for ${candidate.name}`}>
      {[0.33, 0.66, 1].map((r) => <Circle key={r} cx={c} cy={c} r={radius * r} fill="none" stroke="#392e38" strokeWidth="1" />)}
      {axes.map(([label, , dx, dy]) => <Line key={label} x1={c} y1={c} x2={c + dx * radius} y2={c + dy * radius} stroke="#392e38" strokeWidth="1" />)}
      <Polygon points={points} fill="#dca6cb44" stroke="#e9bedf" strokeWidth="2" />
      {axes.map(([label, key, dx, dy]) => (
        <SvgText key={label} x={c + dx * (radius + 22)} y={c + dy * (radius + 18) + (dy === 0 ? 4 : 0)} fill="#afa3ac" fontSize="9" textAnchor="middle">{label} {candidate.fingerprint[key]}</SvgText>
      ))}
    </Svg>
  );
}
