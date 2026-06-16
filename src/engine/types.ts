export interface CalcSuccess {
  ok: true;
  value: number;
  steps: Record<string, number>;
  notes: string[];
}

export interface CalcFailure {
  ok: false;
  error: string;
}

export type CalcResult = CalcSuccess | CalcFailure;
