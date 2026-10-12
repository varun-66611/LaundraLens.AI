export type DatasetId = 'all' | 'northstar' | 'correspondent';
export type WindowId = '7d' | '30d' | 'all';

export interface Account { id: string; name: string; type: string; country: string; openedAt: string }
export interface Transaction { id: string; source: string; target: string; amount: number; timestamp: string; channel: string; datasetId: string }
export interface Signal { id: string; label: string; description: string; weight: number; transactionIds: string[]; edgeIds: string[] }
export interface Candidate {
  id: string; name: string; typology: string; priority: number; accountIds: string[]; transactionIds: string[]; signals: Signal[];
  fingerprint: { structuralComplexity: number; temporalUnusualness: number; flowConcentration: number; relationshipDensity: number };
}
export interface TraceResult {
  generatedAt: string;
  filters: { dataset: DatasetId; window: WindowId; minAmount: number };
  metrics: { accountCount: number; transactionVolume: number; transactionCount: number; candidateNetworks: number; highPriority: number };
  accounts: Account[]; transactions: Transaction[]; candidates: Candidate[]; benignComparison: Candidate;
}
