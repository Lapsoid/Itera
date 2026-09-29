import { useState, useMemo } from 'react';
import type { NumericalMethodType, MethodResult } from '@/core/domain/entities/method-result';
import type {
  BisectionParams,
  FixedPointParams,
  NewtonRaphsonParams,
} from '@/core/domain/entities/solver-params';
import { MathJsEvaluatorAdapter } from '@/infrastructure/math/mathjs-evaluator.adapter';
import { BisectionUseCase } from '@/core/application/use-cases/bisection.usecase';
import { NewtonRaphsonUseCase } from '@/core/application/use-cases/newton-raphson.usecase';
import { FixedPointUseCase } from '@/core/application/use-cases/fixed-point.usecase';
import { NumericalMethodError } from '@/core/domain/errors/domain-errors';

export function useSolver() {
  const [currentMethod, setCurrentMethod] = useState<NumericalMethodType>('bisection');
  const [result, setResult] = useState<MethodResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Instancia del adaptador matemático (Clean Architecture: Puerto inyectado)
  const mathEvaluator = useMemo(() => new MathJsEvaluatorAdapter(), []);

  // Casos de uso
  const bisectionUseCase = useMemo(() => new BisectionUseCase(mathEvaluator), [mathEvaluator]);
  const newtonUseCase = useMemo(() => new NewtonRaphsonUseCase(mathEvaluator), [mathEvaluator]);
  const fixedPointUseCase = useMemo(() => new FixedPointUseCase(mathEvaluator), [mathEvaluator]);

  const executeBisection = (params: BisectionParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = bisectionUseCase.solve(params);
      setResult(res);
      return res;
    } catch (err: unknown) {
      setResult(null);
      const message = err instanceof NumericalMethodError ? err.message : (err as Error).message;
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const executeNewtonRaphson = (params: NewtonRaphsonParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = newtonUseCase.solve(params);
      setResult(res);
      return res;
    } catch (err: unknown) {
      setResult(null);
      const message = err instanceof NumericalMethodError ? err.message : (err as Error).message;
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const executeFixedPoint = (params: FixedPointParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = fixedPointUseCase.solve(params);
      setResult(res);
      return res;
    } catch (err: unknown) {
      setResult(null);
      const message = err instanceof NumericalMethodError ? err.message : (err as Error).message;
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setResult(null);
    setError(null);
  };

  return {
    currentMethod,
    setCurrentMethod,
    result,
    error,
    loading,
    mathEvaluator,
    executeBisection,
    executeNewtonRaphson,
    executeFixedPoint,
    clear,
  };
}
