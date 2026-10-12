import type { Account, DatasetId, Transaction } from './types.js';

const START = Date.parse('2026-09-12T08:00:00.000Z');
const day = 86_400_000;
const minute = 60_000;

function account(id: string, type: Account['type'], country: string): Account {
  const label = type === 'business' ? 'Trading' : type === 'institution' ? 'Financial' : 'Client';
  return { id, name: `${label} ${id.slice(-3)}`, type, country, openedAt: '2024-03-18T00:00:00.000Z' };
}

const northstarAccounts: Account[] = Array.from({ length: 44 }, (_, i) =>
  account(`NS-${String(i + 1).padStart(3, '0')}`, i % 7 === 0 ? 'business' : 'personal', i % 5 === 0 ? 'GB' : 'US'),
);
const correspondentAccounts: Account[] = Array.from({ length: 38 }, (_, i) =>
  account(`CB-${String(i + 1).padStart(3, '0')}`, i % 6 === 0 ? 'business' : 'personal', ['SG', 'AE', 'GB', 'US'][i % 4]),
);

function tx(datasetId: DatasetId, n: number, source: string, target: string, amount: number, at: number, channel: Transaction['channel'] = 'WIRE'): Transaction {
  return { id: `${datasetId === 'northstar' ? 'NST' : 'CBT'}-${String(n).padStart(5, '0')}`, source, target, amount, timestamp: new Date(at).toISOString(), channel, datasetId };
}

function buildNorthstar(): Transaction[] {
  const out: Transaction[] = [];
  let n = 1;
  // Fan-in → rapid relay → fan-out sequence. No labels are stored; TRACE must infer it.
  for (let d = 0; d < 5; d += 1) {
    const base = START + (d + 20) * day;
    for (let i = 2; i <= 5; i += 1) out.push(tx('northstar', n++, `NS-00${i}`, 'NS-001', 41_000 + i * 2_700 + d * 900, base + i * 7 * minute, 'ACH'));
    out.push(tx('northstar', n++, 'NS-001', 'NS-006', 174_800 + d * 3_000, base + 52 * minute));
    out.push(tx('northstar', n++, 'NS-006', 'NS-007', 169_400 + d * 2_900, base + 71 * minute));
    out.push(tx('northstar', n++, 'NS-007', 'NS-008', 162_700 + d * 2_800, base + 89 * minute));
    for (let i = 9; i <= 12; i += 1) out.push(tx('northstar', n++, 'NS-008', `NS-${String(i).padStart(3, '0')}`, 36_000 + i * 1_600 + d * 600, base + (96 + i) * minute));
  }
  // Circular movement cluster.
  for (let d = 0; d < 4; d += 1) {
    const base = START + (d + 14) * day;
    const ring = ['NS-016', 'NS-017', 'NS-018', 'NS-019', 'NS-020', 'NS-021', 'NS-022', 'NS-023'];
    ring.forEach((source, i) => out.push(tx('northstar', n++, source, ring[(i + 1) % ring.length], 54_000 + d * 1_100 - i * 320, base + i * 23 * minute, 'P2P')));
  }
  // Legitimate payroll-like activity and background transfers.
  for (let d = 0; d < 30; d += 3) {
    const base = START + d * day;
    for (let i = 25; i <= 34; i += 1) out.push(tx('northstar', n++, 'NS-024', `NS-${String(i).padStart(3, '0')}`, 2_800 + (i % 4) * 240, base + i * minute, 'ACH'));
  }
  for (let i = 0; i < 42; i += 1) out.push(tx('northstar', n++, `NS-${String(3 + (i % 38)).padStart(3, '0')}`, `NS-${String(4 + ((i * 7) % 39)).padStart(3, '0')}`, 900 + (i * 1_337) % 18_000, START + i * 16 * 60 * minute, i % 2 ? 'ACH' : 'P2P'));
  return out;
}

function buildCorrespondent(): Transaction[] {
  const out: Transaction[] = [];
  let n = 1;
  for (let d = 0; d < 6; d += 1) {
    const base = START + (d + 22) * day;
    for (let i = 2; i <= 7; i += 1) out.push(tx('correspondent', n++, `CB-00${i}`, 'CB-001', 72_000 + i * 4_100 + d * 1_200, base + i * 5 * minute));
    out.push(tx('correspondent', n++, 'CB-001', 'CB-008', 565_000 + d * 9_000, base + 48 * minute));
    out.push(tx('correspondent', n++, 'CB-008', 'CB-009', 548_000 + d * 8_700, base + 63 * minute));
    out.push(tx('correspondent', n++, 'CB-009', 'CB-010', 531_000 + d * 8_400, base + 79 * minute));
    for (let i = 11; i <= 15; i += 1) out.push(tx('correspondent', n++, 'CB-010', `CB-${String(i).padStart(3, '0')}`, 91_000 + i * 3_000 + d * 800, base + (85 + i) * minute));
  }
  for (let i = 0; i < 58; i += 1) out.push(tx('correspondent', n++, `CB-${String(16 + (i % 20)).padStart(3, '0')}`, `CB-${String(16 + ((i * 9 + 3) % 22)).padStart(3, '0')}`, 1_400 + (i * 2_791) % 31_000, START + i * 11 * 60 * minute, i % 3 ? 'ACH' : 'WIRE'));
  return out;
}

export const accounts = [...northstarAccounts, ...correspondentAccounts];
export const transactions = [...buildNorthstar(), ...buildCorrespondent()].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
