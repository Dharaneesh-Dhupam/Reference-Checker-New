
export enum ValidationStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
  UNCERTAIN = 'UNCERTAIN',
  PENDING = 'PENDING',
}

export interface ReferenceResult {
  id: string;
  originalText: string;
  status: ValidationStatus;
  correctedCitation?: string;
  details: string;
  alternatives: string[];
  sourceUrl?: string;
}

export interface AnalysisResponse {
  results: ReferenceResult[];
  rawText?: string;
}

export interface ProcessingState {
  isProcessing: boolean;
  currentStep: string;
  progress: { current: number; total: number };
  error: string | null;
}
