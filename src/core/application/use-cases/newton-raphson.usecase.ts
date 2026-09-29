import type { INumericalSolver } from '../../domain/ports/numerical-solver.port';
import type { IMathEvaluator } from '../../domain/ports/math-evaluator.port';
import type { NewtonRaphsonParams } from '../../domain/entities/solver-params';
import type { MethodResult, StoppingCriterion } from '../../domain/entities/method-result';
import type { IterationStep } from '../../domain/entities/iteration-step';
import { DivergenceError, ZeroDerivativeError, NumericalMethodError } from '../../domain/errors/domain-errors';

export class NewtonRaphsonUseCase implements INumericalSolver<NewtonRaphsonParams> {
  private readonly mathEvaluator: IMathEvaluator;

  constructor(mathEvaluator: IMathEvaluator) {
    this.mathEvaluator = mathEvaluator;
  }

  public solve(params: NewtonRaphsonParams): MethodResult {
    const startTime = performance.now();
    const { expressionF, expressionDf, x0, tolerance, maxIterations, errorType = 'relative' } = params;

    // Obtener la derivada simbólica si el usuario no ingresó una personalizada
    let dfExpr = expressionDf?.trim();
    if (!dfExpr) {
      try {
        dfExpr = this.mathEvaluator.derivative(expressionF);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        throw new NumericalMethodError(`No se pudo derivar simbólicamente la función: ${errorMsg}`);
      }
    }

    const history: IterationStep[] = [];
    let currentX = x0;
    let converged = false;
    let stoppedBy: StoppingCriterion = 'max_iterations';
    let finalError = Infinity;

    for (let k = 1; k <= maxIterations; k++) {
      const fx = this.mathEvaluator.evaluate(expressionF, currentX);
      const dfx = this.mathEvaluator.evaluate(dfExpr, currentX);

      if (Number.isNaN(fx) || !Number.isFinite(fx)) {
        throw new DivergenceError(k, currentX, 'f(x) produjo un valor indefinido o no numérico.');
      }

      // Si la función ya evaluó en 0 exacto
      if (Math.abs(fx) < 1e-15) {
        history.push({
          iteration: k,
          currentX,
          functionValue: fx,
          derivativeValue: dfx,
          absoluteError: 0,
          relativeErrorPercentage: 0,
        });
        converged = true;
        stoppedBy = 'exact_root';
        break;
      }

      // Verificación de derivada nula
      if (Math.abs(dfx) < 1e-12) {
        throw new ZeroDerivativeError(currentX, dfx);
      }

      const nextX = currentX - fx / dfx;

      if (Number.isNaN(nextX) || !Number.isFinite(nextX) || Math.abs(nextX) > 1e12) {
        throw new DivergenceError(k, nextX, 'El cálculo de x_(k+1) divergió o generó desbordamiento.');
      }

      const absoluteError = Math.abs(nextX - currentX);
      const relativeErrorPercentage =
        Math.abs(nextX) > 1e-15 ? Math.abs((nextX - currentX) / nextX) * 100 : absoluteError * 100;

      finalError = errorType === 'relative' ? relativeErrorPercentage : absoluteError;

      history.push({
        iteration: k,
        currentX,
        previousX: currentX,
        functionValue: fx,
        derivativeValue: dfx,
        absoluteError,
        relativeErrorPercentage,
      });

      if (finalError < tolerance) {
        converged = true;
        stoppedBy = 'tolerance';
        currentX = nextX;
        break;
      }

      currentX = nextX;
    }

    return {
      method: 'newton-raphson',
      root: currentX,
      converged,
      iterationsCount: history.length,
      executionTimeMs: performance.now() - startTime,
      history,
      finalError,
      stoppedBy,
      message: converged
        ? `Newton-Raphson convergió exitosamente en ${history.length} iteraciones.`
        : `Se alcanzó el límite de ${maxIterations} iteraciones sin alcanzar la tolerancia requerida.`,
    };
  }
}
