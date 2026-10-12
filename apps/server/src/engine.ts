import { MultiUndirectedGraph } from 'graphology';
import { accounts as allAccounts, transactions as allTransactions } from './data.js';
import type { AnalysisFilters, CandidateNetwork, EvidenceSignal, TraceResult, Transaction } from './types.js';

const edgeId = (t: Transaction) => `${t.source}->${t.target}`;
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function connectedComponents(nodes: Set<string>, transactions: Transaction[]): string[][] {
  const graph = new MultiUndirectedGraph();
  nodes.forEach((id) => graph.addNode(id));
  transactions.forEach((t) => {
    if (nodes.has(t.source) && nodes.has(t.target)) graph.addEdge(t.source, t.target);
  });
  const seen = new Set<string>();
  const groups: string[][] = [];
  graph.forEachNode((node: string) => {
    if (seen.has(node)) return;
    const queue = [node];
    const group: string[] = [];
    seen.add(node);
    while (queue.length) {
      const current = queue.shift()!;
      group.push(current);
      graph.forEachNeighbor(current, (neighbor: string) => {
        if (!seen.has(neighbor)) { seen.add(neighbor); queue.push(neighbor); }
      });
    }
    if (group.length >= 4) groups.push(group);
  });
  return groups;
}

function evidenceFor(group: string[], txs: Transaction[]): EvidenceSignal[] {
  const groupSet = new Set(group);
  const relevant = txs.filter((t) => groupSet.has(t.source) && groupSet.has(t.target));
  const signals: EvidenceSignal[] = [];
  const rapid: Transaction[] = [];
  for (const incoming of relevant) {
    const inTime = Date.parse(incoming.timestamp);
    const next = relevant.find((outgoing) => outgoing.source === incoming.target && Date.parse(outgoing.timestamp) > inTime && Date.parse(outgoing.timestamp) - inTime <= 120 * 60_000 && outgoing.amount >= incoming.amount * 0.72);
    if (next) rapid.push(incoming, next);
  }
  const uniqueRapid = [...new Map(rapid.map((t) => [t.id, t])).values()];
  if (uniqueRapid.length >= 2) signals.push({
    id: 'rapid-relay', label: 'Rapid value relay', weight: 34,
    description: `${uniqueRapid.length} transfers pass through intermediary accounts within two hours while retaining most of the incoming value.`,
    transactionIds: uniqueRapid.slice(0, 12).map((t) => t.id), edgeIds: uniqueRapid.slice(0, 12).map(edgeId),
  });
  const degrees = new Map<string, Set<string>>();
  relevant.forEach((t) => { degrees.set(t.source, (degrees.get(t.source) ?? new Set()).add(t.target)); degrees.set(t.target, (degrees.get(t.target) ?? new Set()).add(t.source)); });
  const hubs = [...degrees.entries()].filter(([, neighbors]) => neighbors.size >= 4).sort((a, b) => b[1].size - a[1].size);
  if (hubs.length) {
    const hubTx = relevant.filter((t) => hubs.some(([id]) => t.source === id || t.target === id));
    signals.push({ id: 'fan-pattern', label: 'Concentrated fan-in / fan-out', weight: 28, description: `${hubs[0][0]} connects ${hubs[0][1].size} counterparties, concentrating otherwise unrelated transfer paths.`, transactionIds: hubTx.slice(0, 12).map((t) => t.id), edgeIds: hubTx.slice(0, 12).map(edgeId) });
  }
  const pairs = new Set(relevant.map(edgeId));
  const cycleTx = relevant.filter((t) => relevant.some((u) => u.source === t.target && pairs.has(`${u.target}->${t.source}`)));
  if (cycleTx.length >= 2) signals.push({ id: 'circular-flow', label: 'Circular movement', weight: 31, description: `Value returns through reciprocal or circular paths across ${new Set(cycleTx.flatMap((t) => [t.source, t.target])).size} accounts.`, transactionIds: cycleTx.slice(0, 12).map((t) => t.id), edgeIds: cycleTx.slice(0, 12).map(edgeId) });
  const repeated = relevant.filter((t) => t.amount >= 40_000);
  if (repeated.length >= 4) signals.push({ id: 'repeated-high-value', label: 'Repeated high-value transfers', weight: 22, description: `${repeated.length} transfers above $40K recur inside a tightly connected account set.`, transactionIds: repeated.slice(0, 12).map((t) => t.id), edgeIds: repeated.slice(0, 12).map(edgeId) });
  return signals;
}

function candidate(group: string[], txs: Transaction[], index: number): CandidateNetwork {
  const set = new Set(group);
  const relevant = txs.filter((t) => set.has(t.source) && set.has(t.target));
  const signals = evidenceFor(group, txs);
  const uniqueEdges = new Set(relevant.map(edgeId)).size;
  const density = uniqueEdges / Math.max(1, group.length * (group.length - 1));
  const totals = group.map((id) => relevant.filter((t) => t.source === id || t.target === id).reduce((sum, t) => sum + t.amount, 0));
  const concentration = Math.max(...totals, 0) / Math.max(1, totals.reduce((a, b) => a + b, 0));
  const timestamps = relevant.map((t) => Date.parse(t.timestamp)).sort((a, b) => a - b);
  const gaps = timestamps.slice(1).map((t, i) => t - timestamps[i]);
  const fastRatio = gaps.filter((g) => g <= 2 * 60 * 60_000).length / Math.max(1, gaps.length);
  const fingerprint = {
    structuralComplexity: clamp(35 + uniqueEdges * 2.1),
    temporalUnusualness: clamp(25 + fastRatio * 74),
    flowConcentration: clamp(concentration * 290),
    relationshipDensity: clamp(density * 420),
  };
  const priority = clamp(Object.values(fingerprint).reduce((a, b) => a + b, 0) / 4 + signals.reduce((sum, s) => sum + s.weight, 0) * 0.18);
  const typology = signals.some((s) => s.id === 'circular-flow') ? 'Circular flow' : signals.some((s) => s.id === 'fan-pattern') ? 'Layered relay' : 'Dense transfer cluster';
  return { id: `TRACE-${String(index + 1).padStart(3, '0')}`, name: index === 0 ? 'Transaction Network' : `${typology} ${String.fromCharCode(65 + index)}`, typology, priority, accountIds: group.slice(0, 30), transactionIds: relevant.map((t) => t.id), signals, fingerprint };
}

export function runTrace(filters: AnalysisFilters): TraceResult {
  const datasetTx = allTransactions.filter((t) => filters.dataset === 'all' || t.datasetId === filters.dataset);
  const latest = Math.max(...datasetTx.map((t) => Date.parse(t.timestamp)));
  const cutoff = filters.window === 'all' ? 0 : latest - (filters.window === '7d' ? 7 : 30) * 86_400_000;
  const transactions = datasetTx.filter((t) => Date.parse(t.timestamp) >= cutoff && t.amount >= filters.minAmount);
  const accountIds = new Set(transactions.flatMap((t) => [t.source, t.target]));
  const relevantAccounts = allAccounts.filter((a) => accountIds.has(a.id));
  const suspiciousTx = transactions.filter((t) => t.amount >= Math.max(filters.minAmount, 35_000));
  const suspiciousNodes = new Set(suspiciousTx.flatMap((t) => [t.source, t.target]));
  const groups = connectedComponents(suspiciousNodes, suspiciousTx).filter((g) => g.length >= 4 && g.length <= 30);
  const candidates = groups.map((g, i) => candidate(g, transactions, i)).filter((c) => c.signals.length > 0).sort((a, b) => b.priority - a.priority);
  const benignIds = relevantAccounts.filter((a) => a.id.startsWith('NS-02') || a.id.startsWith('NS-03')).slice(0, 10).map((a) => a.id);
  const benignTx = transactions.filter((t) => benignIds.includes(t.source) && benignIds.includes(t.target));
  const benignComparison: CandidateNetwork = {
    id: 'BENIGN-001', name: 'Recurring payroll cohort', typology: 'Expected business activity', priority: 18,
    accountIds: benignIds, transactionIds: benignTx.map((t) => t.id), signals: [{ id: 'stable-cadence', label: 'Stable expected cadence', weight: 8, description: 'Transfers recur from one established business account at predictable intervals and comparable amounts.', transactionIds: benignTx.slice(0, 8).map((t) => t.id), edgeIds: benignTx.slice(0, 8).map(edgeId) }],
    fingerprint: { structuralComplexity: 22, temporalUnusualness: 11, flowConcentration: 49, relationshipDensity: 18 },
  };
  return {
    generatedAt: new Date().toISOString(), filters,
    metrics: { accountCount: relevantAccounts.length, transactionVolume: transactions.reduce((sum, t) => sum + t.amount, 0), transactionCount: transactions.length, candidateNetworks: candidates.length, highPriority: candidates.filter((c) => c.priority >= 70).length },
    accounts: relevantAccounts, transactions, candidates, benignComparison,
  };
}
