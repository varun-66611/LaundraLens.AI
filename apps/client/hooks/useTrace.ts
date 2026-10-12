import { useEffect, useState } from 'react';
import { fallbackResult } from '../lib/fallback';
import type { TraceResult } from '../lib/types';

const API = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

export function useTrace() {
  const [result, setResult] = useState<TraceResult>(() => fallbackResult('all', '30d', 0));
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    fetch(`${API}/api/trace`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ dataset: 'all', window: '30d', minAmount: 0 }) })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('API unavailable')))
      .then((next: TraceResult) => { if (mounted) setResult(next); })
      .catch(() => undefined)
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);
  return { result, loading };
}
