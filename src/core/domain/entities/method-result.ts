import type { IterationStep } from './iteration-step';

export type StoppingCriterion = 'tolerance' | 'max_iterations' | 'exact_root' | 'stagnation';
export type NumericalMethodType = 'bisection' | 'fixed-point' | 'newton-raphson';

export interface MethodResult {
  method: NumericalMethodType;
  root: number;
  converged: boolean;
  iterationsCount: number;
  executionTimeMs: number;
  history: IterationStep[];
  finalError: number;
  stoppedBy: StoppingCriterion;
  message?: string;
}
