import type { INumericalSolver } from '../../domain/ports/numerical-solver.port';
import type { IMathEvaluator } from '../../domain/ports/math-evaluator.port';
import type { FixedPointParams } from '../../domain/entities/solver-params';
import type { MethodResult, StoppingCriterion } from '../../domain/entities/method-result';
import type { IterationStep } from '../../domain/entities/iteration-step';
import { DivergenceError } from '../../domain/errors/domain-errors';

export class FixedPointUseCase implements INumericalSolver<FixedPointParams> {
  private readonly mathEvaluator: IMathEvaluator;

  constructor(mathEvaluator: IMathEvaluator) {
    this.mathEvaluator = mathEvaluator;
  }

  public solve(params: FixedPointParams): MethodResult {
    const startTime = performance.now();
    const { expressionF, expressionG, x0, tolerance, maxIterations, errorType = 'relative' } = params;

    const history: IterationStep[] = [];
    let currentX = x0;
    let converged = false;
    let stoppedBy: StoppingCriterion = 'max_iterations';
    let finalError = Infinity;

    for (let k = 1; k <= maxIterations; k++) {
      const gx = this.mathEvaluator.evaluate(expressionG, currentX);

      // Verificación de divergencia o valor no numérico
      if (Number.isNaN(gx) || !Number.isFinite(gx) || Math.abs(gx) > 1e12) {
        throw new DivergenceError(
          k,
          currentX,
          `g(${currentX.toFixed(6)}) produjo ${gx}. El método diverge o excede la cota de cálculo.`
        );
      }

      // Si el usuario proporcionó f(x) para referencia, se evalúa, si no, se evalúa x - g(x)
      const fx = expressionF?.trim()
        ? this.mathEvaluator.evaluate(expressionF, currentX)
        : currentX - gx;

      const absoluteError = Math.abs(gx - currentX);
      const relativeErrorPercentage =
        Math.abs(gx) > 1e-15 ? Math.abs((gx - currentX) / gx) * 100 : absoluteError * 100;

      finalError = errorType === 'relative' ? relativeErrorPercentage : absoluteError;

      history.push({
        iteration: k,
        currentX,
        previousX: currentX,
        functionValue: fx,
        gxValue: gx,
        absoluteError,
        relativeErrorPercentage,
      });

      // Si la diferencia es menor a la tolerancia
      if (finalError < tolerance) {
        converged = true;
        stoppedBy = 'tolerance';
        currentX = gx;
        break;
      }

      currentX = gx;
    }

    return {
      method: 'fixed-point',
      root: currentX,
      converged,
      iterationsCount: history.length,
      executionTimeMs: performance.now() - startTime,
      history,
      finalError,
      stoppedBy,
      message: converged
        ? `Punto Fijo convergió exitosamente en ${history.length} iteraciones.`
        : `Se alcanzó el número máximo de iteraciones (${maxIterations}) sin alcanzar la convergencia deseada.`,
    };
  }
}
