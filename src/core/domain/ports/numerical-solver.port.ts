import type { MethodResult } from '../entities/method-result';

export interface INumericalSolver<TParams> {
  solve(params: TParams): MethodResult;
}
