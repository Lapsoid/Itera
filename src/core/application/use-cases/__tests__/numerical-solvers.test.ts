import { describe, it, expect, beforeEach } from 'vitest';
import { MathJsEvaluatorAdapter } from '../../../../infrastructure/math/mathjs-evaluator.adapter';
import { BisectionUseCase } from '../bisection.usecase';
import { NewtonRaphsonUseCase } from '../newton-raphson.usecase';
import { FixedPointUseCase } from '../fixed-point.usecase';
import {
  BolzanoViolationError,
  InvalidIntervalError,
  ZeroDerivativeError,
  DivergenceError,
} from '../../../domain/errors/domain-errors';

describe('Numerical Methods Use Cases', () => {
  let evaluator: MathJsEvaluatorAdapter;

  beforeEach(() => {
    evaluator = new MathJsEvaluatorAdapter();
  });

  describe('Método de Bisección', () => {
    it('debe converger a la raíz de x^3 - x - 2 en [1, 2]', () => {
      const useCase = new BisectionUseCase(evaluator);
      const result = useCase.solve({
        expression: 'x^3 - x - 2',
        a: 1,
        b: 2,
        tolerance: 0.0001,
        maxIterations: 50,
        errorType: 'relative',
      });

      expect(result.converged).toBe(true);
      expect(result.root).toBeCloseTo(1.521379, 3);
      expect(result.history.length).toBeGreaterThan(0);
    });

    it('debe lanzar BolzanoViolationError si f(a) y f(b) tienen el mismo signo', () => {
      const useCase = new BisectionUseCase(evaluator);
      expect(() => {
        useCase.solve({
          expression: 'x^2 + 1',
          a: 1,
          b: 2,
          tolerance: 0.001,
          maxIterations: 20,
        });
      }).toThrow(BolzanoViolationError);
    });

    it('debe lanzar InvalidIntervalError si a >= b', () => {
      const useCase = new BisectionUseCase(evaluator);
      expect(() => {
        useCase.solve({
          expression: 'x^3 - x - 2',
          a: 2,
          b: 1,
          tolerance: 0.001,
          maxIterations: 20,
        });
      }).toThrow(InvalidIntervalError);
    });
  });

  describe('Método de Newton-Raphson', () => {
    it('debe converger a la raíz de e^(-x) - x con x0 = 0', () => {
      const useCase = new NewtonRaphsonUseCase(evaluator);
      const result = useCase.solve({
        expressionF: 'exp(-x) - x',
        x0: 0,
        tolerance: 0.00001,
        maxIterations: 30,
        errorType: 'relative',
      });

      expect(result.converged).toBe(true);
      expect(result.root).toBeCloseTo(0.567143, 4);
    });

    it('debe detectar derivada nula y lanzar ZeroDerivativeError', () => {
      const useCase = new NewtonRaphsonUseCase(evaluator);
      // Para x^2 - 1, la derivada es 2x. En x0 = 0, f'(0) = 0
      expect(() => {
        useCase.solve({
          expressionF: 'x^2 - 1',
          x0: 0,
          tolerance: 0.001,
          maxIterations: 20,
        });
      }).toThrow(ZeroDerivativeError);
    });

    it('debe permitir derivada provista manualmente por el usuario', () => {
      const useCase = new NewtonRaphsonUseCase(evaluator);
      const result = useCase.solve({
        expressionF: 'x^2 - 4',
        expressionDf: '2 * x',
        x0: 3,
        tolerance: 0.0001,
        maxIterations: 20,
      });

      expect(result.converged).toBe(true);
      expect(result.root).toBeCloseTo(2.0, 4);
    });
  });

  describe('Método de Punto Fijo', () => {
    it('debe converger para g(x) = cos(x) con x0 = 0.5', () => {
      const useCase = new FixedPointUseCase(evaluator);
      const result = useCase.solve({
        expressionG: 'cos(x)',
        x0: 0.5,
        tolerance: 0.00001,
        maxIterations: 50,
      });

      expect(result.converged).toBe(true);
      expect(result.root).toBeCloseTo(0.739085, 4);
    });

    it('debe detectar divergencia con función explosiva', () => {
      const useCase = new FixedPointUseCase(evaluator);
      expect(() => {
        useCase.solve({
          expressionG: 'x^3 + 10',
          x0: 5,
          tolerance: 0.00001,
          maxIterations: 20,
        });
      }).toThrow(DivergenceError);
    });
  });
});
