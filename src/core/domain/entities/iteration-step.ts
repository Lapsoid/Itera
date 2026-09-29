export interface IterationStep {
  iteration: number;
  currentX: number;
  previousX?: number;
  functionValue: number;
  // Bisección
  intervalA?: number;
  intervalB?: number;
  fa?: number;
  fb?: number;
  // Newton-Raphson
  derivativeValue?: number;
  // Punto Fijo
  gxValue?: number;
  // Errores
  absoluteError: number;
  relativeErrorPercentage: number;
}
