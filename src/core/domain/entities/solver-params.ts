export type ErrorType = 'relative' | 'absolute';

export interface BaseSolverParams {
  tolerance: number;
  maxIterations: number;
  errorType?: ErrorType;
}

export interface BisectionParams extends BaseSolverParams {
  expression: string;
  a: number;
  b: number;
}

export interface FixedPointParams extends BaseSolverParams {
  expressionF?: string; // f(x) original para evaluar f(root)
  expressionG: string; // g(x) tal que x = g(x)
  x0: number;
}

export interface NewtonRaphsonParams extends BaseSolverParams {
  expressionF: string;
  expressionDf?: string; // Opcional: si el usuario la provee o si se calcula simbólicamente
  x0: number;
}
