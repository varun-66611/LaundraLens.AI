import { describe, expect, it } from 'vitest';
import { runTrace } from './engine.js';

describe('TRACE engine', () => {
  it('derives explainable candidates from the seeded transactions', () => {
    const result = runTrace({ dataset: 'all', window: '30d', minAmount: 0 });
    expect(result.metrics.accountCount).toBeGreaterThan(30);
    expect(result.candidates.length).toBeGreaterThanOrEqual(2);
    expect(result.candidates[0].signals.length).toBeGreaterThan(0);
    expect(result.candidates[0].signals[0].transactionIds[0]).toMatch(/^(NST|CBT)-/);
    expect(result.candidates[0].accountIds.length).toBeGreaterThanOrEqual(10);
    expect(result.candidates[0].accountIds.length).toBeLessThanOrEqual(30);
  });

  it('recomputes metrics when filters change', () => {
    const all = runTrace({ dataset: 'all', window: 'all', minAmount: 0 });
    const filtered = runTrace({ dataset: 'northstar', window: '7d', minAmount: 40_000 });
    expect(filtered.metrics.transactionCount).toBeLessThan(all.metrics.transactionCount);
    expect(filtered.metrics.transactionVolume).toBeLessThan(all.metrics.transactionVolume);
  });
});
