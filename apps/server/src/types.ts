export type DatasetId = 'northstar' | 'correspondent';

export interface Account {
  id: string;
  name: string;
  type: 'personal' | 'business' | 'institution';
  country: string;
  openedAt: string;
}

export interface Transaction {
  id: string;
  source: string;
  target: string;
  amount: number;
  timestamp: string;
  channel: 'ACH' | 'WIRE' | 'P2P';
  datasetId: DatasetId;
}

export interface AnalysisFilters {
  dataset: DatasetId | 'all';
  window: '7d' | '30d' | 'all';
  minAmount: number;
}

export interface EvidenceSignal {
  id: string;
  label: string;
  description: string;
  weight: number;
  transactionIds: string[];
  edgeIds: string[];
}

export interface CandidateNetwork {
  id: string;
  name: string;
  typology: string;
  priority: number;
  accountIds: string[];
  transactionIds: string[];
  signals: EvidenceSignal[];
  fingerprint: {
    structuralComplexity: number;
    temporalUnusualness: number;
    flowConcentration: number;
    relationshipDensity: number;
  };
}

export interface TraceResult {
  generatedAt: string;
  filters: AnalysisFilters;
  metrics: {
    accountCount: number;
    transactionVolume: number;
    transactionCount: number;
    candidateNetworks: number;
    highPriority: number;
  };
  accounts: Account[];
  transactions: Transaction[];
  candidates: CandidateNetwork[];
  benignComparison: CandidateNetwork;
}
