import Svg, { Circle, Defs, G, Line, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import type { Candidate, Transaction } from '../lib/types';

export function NetworkGraph({ candidate, transactions, visibleCount, highlightedEdges }: { candidate: Candidate; transactions: Transaction[]; visibleCount: number; highlightedEdges: string[] }) {
  const width = 720;
  const height = 410;
  const cx = width / 2;
  const cy = height / 2;
  const nodes = candidate.accountIds.map((id, i) => {
    const isHub = id.endsWith('001') || id.endsWith('008') || id.endsWith('010');
    const ring = isHub ? 66 : 155 + (i % 3) * 25;
    const angle = (i / candidate.accountIds.length) * Math.PI * 2 - Math.PI / 2;
    return { id, x: isHub ? cx + Math.cos(angle) * ring : cx + Math.cos(angle) * ring, y: isHub ? cy + Math.sin(angle) * ring : cy + Math.sin(angle) * ring, isHub };
  });
  const map = new Map(nodes.map((node) => [node.id, node]));
  const relevant = transactions.filter((t) => candidate.transactionIds.includes(t.id)).slice(0, visibleCount);
  return (
    <Svg width="100%" height={410} viewBox={`0 0 ${width} ${height}`} accessibilityLabel={`Relationship graph for ${candidate.name}`}>
      <Defs><LinearGradient id="node" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#f1c6e3" /><Stop offset="1" stopColor="#8b607f" /></LinearGradient></Defs>
      <G>
        {relevant.map((t) => {
          const source = map.get(t.source); const target = map.get(t.target); if (!source || !target) return null;
          const active = highlightedEdges.includes(`${t.source}->${t.target}`);
          return <Line key={t.id} x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke={active ? '#ffd6ee' : '#75566e'} strokeWidth={active ? 3.5 : 1.2} opacity={active ? 1 : 0.46} />;
        })}
        {nodes.map((node) => (
          <G key={node.id}>
            {node.isHub && <Circle cx={node.x} cy={node.y} r="24" fill="#dca6cb22" stroke="#dca6cb55" strokeWidth="1" />}
            <Circle cx={node.x} cy={node.y} r={node.isHub ? 12 : 8} fill={node.isHub ? 'url(#node)' : '#171218'} stroke={node.isHub ? '#fff0fa' : '#c38eb5'} strokeWidth={node.isHub ? 2 : 1.5} />
            <SvgText x={node.x} y={node.y + (node.isHub ? 35 : 24)} textAnchor="middle" fill="#a99ea6" fontSize="9">{node.id}</SvgText>
          </G>
        ))}
      </G>
    </Svg>
  );
}
