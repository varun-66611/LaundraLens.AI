import type { Candidate, DatasetId, TraceResult, Transaction, WindowId } from './types';

const accountIds = Array.from({ length: 15 }, (_, i) => `CB-${String(i + 1).padStart(3, '0')}`);
const transactions: Transaction[] = [];
let n = 1;
for (let d = 0; d < 6; d += 1) {
  const base = Date.parse('2026-10-04T08:00:00.000Z') + d * 86_400_000;
  for (let i = 2; i <= 7; i += 1) transactions.push({ id: `CBT-${String(n++).padStart(5, '0')}`, source: `CB-00${i}`, target: 'CB-001', amount: 72_000 + i * 4_100, timestamp: new Date(base + i * 300_000).toISOString(), channel: 'WIRE', datasetId: 'correspondent' });
  transactions.push({ id: `CBT-${String(n++).padStart(5, '0')}`, source: 'CB-001', target: 'CB-008', amount: 565_000, timestamp: new Date(base + 48 * 60_000).toISOString(), channel: 'WIRE', datasetId: 'correspondent' });
  transactions.push({ id: `CBT-${String(n++).padStart(5, '0')}`, source: 'CB-008', target: 'CB-009', amount: 548_000, timestamp: new Date(base + 63 * 60_000).toISOString(), channel: 'WIRE', datasetId: 'correspondent' });
  transactions.push({ id: `CBT-${String(n++).padStart(5, '0')}`, source: 'CB-009', target: 'CB-010', amount: 531_000, timestamp: new Date(base + 79 * 60_000).toISOString(), channel: 'WIRE', datasetId: 'correspondent' });
  for (let i = 11; i <= 15; i += 1) transactions.push({ id: `CBT-${String(n++).padStart(5, '0')}`, source: 'CB-010', target: `CB-0${i}`, amount: 91_000 + i * 3_000, timestamp: new Date(base + (85 + i) * 60_000).toISOString(), channel: 'WIRE', datasetId: 'correspondent' });
}
const keyTx = transactions.slice(0, 14);
const candidate: Candidate = {
  id: 'TRACE-001', name: 'Transaction Network', typology: 'Layered relay', priority: 92, accountIds, transactionIds: transactions.map((t) => t.id),
  signals: [
    { id: 'rapid-relay', label: 'Rapid value relay', description: '12 transfers pass through intermediary accounts within two hours while retaining most of the incoming value.', weight: 34, transactionIds: keyTx.slice(6, 10).map((t) => t.id), edgeIds: keyTx.slice(6, 10).map((t) => `${t.source}->${t.target}`) },
    { id: 'fan-pattern', label: 'Concentrated fan-in / fan-out', description: 'CB-001 connects 7 counterparties, concentrating otherwise unrelated transfer paths.', weight: 28, transactionIds: keyTx.slice(0, 8).map((t) => t.id), edgeIds: keyTx.slice(0, 8).map((t) => `${t.source}->${t.target}`) },
    { id: 'repeated-high-value', label: 'Repeated high-value transfers', description: '84 transfers above ₹40,000 recur inside a tightly connected account set.', weight: 22, transactionIds: keyTx.map((t) => t.id), edgeIds: keyTx.map((t) => `${t.source}->${t.target}`) },
  ], fingerprint: { structuralComplexity: 88, temporalUnusualness: 96, flowConcentration: 91, relationshipDensity: 73 },
};
const candidate2: Candidate = { ...candidate, id: 'TRACE-002', name: 'Circular flow B', typology: 'Circular flow', priority: 78, accountIds: accountIds.slice(0, 12), fingerprint: { structuralComplexity: 81, temporalUnusualness: 74, flowConcentration: 63, relationshipDensity: 86 } };
const benign: Candidate = { ...candidate, id: 'BENIGN-001', name: 'Recurring payroll cohort', typology: 'Expected business activity', priority: 18, accountIds: accountIds.slice(0, 10), signals: [{ id: 'stable-cadence', label: 'Stable expected cadence', description: 'Transfers recur from one established business account at predictable intervals and comparable amounts.', weight: 8, transactionIds: keyTx.slice(0, 5).map((t) => t.id), edgeIds: keyTx.slice(0, 5).map((t) => `${t.source}->${t.target}`) }], fingerprint: { structuralComplexity: 22, temporalUnusualness: 11, flowConcentration: 49, relationshipDensity: 18 } };

export function fallbackResult(dataset: DatasetId, window: WindowId, minAmount: number): TraceResult {
  const multiplier = dataset === 'all' ? 1 : dataset === 'correspondent' ? 0.56 : 0.44;
  const days = window === '7d' ? 0.34 : window === '30d' ? 0.82 : 1;
  const filtered = transactions.filter((t) => t.amount >= minAmount).slice(0, Math.max(12, Math.round(transactions.length * days)));
  return {
    generatedAt: new Date().toISOString(), filters: { dataset, window, minAmount },
    metrics: { accountCount: Math.round(82 * multiplier * days), transactionVolume: filtered.reduce((sum, t) => sum + t.amount, 0) / Math.max(0.56, multiplier), transactionCount: Math.round(298 * multiplier * days), candidateNetworks: dataset === 'all' ? 2 : 1, highPriority: 1 },
    accounts: accountIds.map((id, i) => ({ id, name: `Client ${id.slice(-3)}`, type: i % 6 === 0 ? 'business' : 'personal', country: ['SG', 'AE', 'GB', 'US'][i % 4], openedAt: '2024-03-18T00:00:00.000Z' })),
    transactions: filtered, candidates: dataset === 'all' ? [candidate, candidate2] : [candidate], benignComparison: benign,
  };
}
