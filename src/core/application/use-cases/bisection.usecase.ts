import type { INumericalSolver } from '../../domain/ports/numerical-solver.port';
import type { IMathEvaluator } from '../../domain/ports/math-evaluator.port';
import type { BisectionParams } from '../../domain/entities/solver-params';
import type { MethodResult, StoppingCriterion } from '../../domain/entities/method-result';
import type { IterationStep } from '../../domain/entities/iteration-step';
import { BolzanoViolationError, InvalidIntervalError, NumericalMethodError } from '../../domain/errors/domain-errors';

export class BisectionUseCase implements INumericalSolver<BisectionParams> {
  private readonly mathEvaluator: IMathEvaluator;

  constructor(mathEvaluator: IMathEvaluator) {
    this.mathEvaluator = mathEvaluator;
  }

  public solve(params: BisectionParams): MethodResult {
    const startTime = performance.now();
    let { a, b } = params;
    const { expression, tolerance, maxIterations, errorType = 'relative' } = params;

    if (a >= b) {
      throw new InvalidIntervalError(a, b);
    }

    let fa = this.mathEvaluator.evaluate(expression, a);
    let fb = this.mathEvaluator.evaluate(expression, b);

    if (Number.isNaN(fa) || !Number.isFinite(fa) || Number.isNaN(fb) || !Number.isFinite(fb)) {
      throw new NumericalMethodError(`La función no está definida o produce valores indeterminados en los extremos del intervalo [${a}, ${b}].`);
    }

    // Comprobación de raíces en los extremos exactos
    if (Math.abs(fa) < 1e-15) {
      return {
        method: 'bisection',
        root: a,
        converged: true,
        iterationsCount: 0,
        executionTimeMs: performance.now() - startTime,
        history: [
          {
            iteration: 0,
            currentX: a,
            functionValue: fa,
            intervalA: a,
            intervalB: b,
            fa,
            fb,
            absoluteError: 0,
            relativeErrorPercentage: 0,
          },
        ],
        finalError: 0,
        stoppedBy: 'exact_root',
        message: 'El límite inferior es una raíz exacta de la función.',
      };
    }

    if (Math.abs(fb) < 1e-15) {
      return {
        method: 'bisection',
        root: b,
        converged: true,
        iterationsCount: 0,
        executionTimeMs: performance.now() - startTime,
        history: [
          {
            iteration: 0,
            currentX: b,
            functionValue: fb,
            intervalA: a,
            intervalB: b,
            fa,
            fb,
            absoluteError: 0,
            relativeErrorPercentage: 0,
          },
        ],
        finalError: 0,
        stoppedBy: 'exact_root',
        message: 'El límite superior es una raíz exacta de la función.',
      };
    }

    // Teorema de Bolzano
    if (fa * fb > 0) {
      throw new BolzanoViolationError(fa, fb, a, b);
    }

    const history: IterationStep[] = [];
    let previousC: number | undefined = undefined;
    let converged = false;
    let stoppedBy: StoppingCriterion = 'max_iterations';
    let currentC = a;
    let finalError = Infinity;

    for (let k = 1; k <= maxIterations; k++) {
      currentC = (a + b) / 2;
      const fc = this.mathEvaluator.evaluate(expression, currentC);

      let absoluteError = previousC !== undefined ? Math.abs(currentC - previousC) : Math.abs(b - a);
      let relativeErrorPercentage =
        previousC !== undefined
          ? Math.abs(currentC) > 1e-15
            ? Math.abs((currentC - previousC) / currentC) * 100
            : absoluteError * 100
          : 100;

      finalError = errorType === 'relative' ? relativeErrorPercentage : absoluteError;

      history.push({
        iteration: k,
        currentX: currentC,
        previousX: previousC,
        functionValue: fc,
        intervalA: a,
        intervalB: b,
        fa,
        fb,
        absoluteError,
        relativeErrorPercentage,
      });

      // Condiciones de parada
      if (Math.abs(fc) < 1e-15) {
        converged = true;
        stoppedBy = 'exact_root';
        break;
      }

      if (k > 1 && finalError < tolerance) {
        converged = true;
        stoppedBy = 'tolerance';
        break;
      }

      // Actualización de extremos según Bolzano
      if (fa * fc < 0) {
        b = currentC;
        fb = fc;
      } else {
        a = currentC;
        fa = fc;
      }

      previousC = currentC;
    }

    return {
      method: 'bisection',
      root: currentC,
      converged,
      iterationsCount: history.length,
      executionTimeMs: performance.now() - startTime,
      history,
      finalError,
      stoppedBy,
      message: converged
        ? `Convergencia exitosa alcanzada en ${history.length} iteraciones.`
        : `Se alcanzó el número máximo de iteraciones (${maxIterations}) sin cumplir la tolerancia deseada.`,
    };
  }
}
