import { compile, derivative, parse, type EvalFunction } from 'mathjs';
import type { IMathEvaluator } from '../../core/domain/ports/math-evaluator.port';
import { InvalidExpressionError } from '../../core/domain/errors/domain-errors';

export class MathJsEvaluatorAdapter implements IMathEvaluator {
  private compiledCache = new Map<string, EvalFunction>();

  private getCompiled(expression: string): EvalFunction {
    let compiled = this.compiledCache.get(expression);
    if (!compiled) {
      try {
        compiled = compile(expression) as EvalFunction;
        this.compiledCache.set(expression, compiled);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        throw new InvalidExpressionError(expression, errorMsg);
      }
    }
    return compiled;
  }

  public evaluate(expression: string, x: number): number {
    try {
      const compiled = this.getCompiled(expression);
      const val = compiled.evaluate({ x, e: Math.E, pi: Math.PI, E: Math.E, PI: Math.PI });
      if (typeof val !== 'number') {
        throw new Error('La expresión no retornó un valor numérico real.');
      }
      return val;
    } catch (err: unknown) {
      if (err instanceof InvalidExpressionError) throw err;
      const errorMsg = err instanceof Error ? err.message : String(err);
      throw new InvalidExpressionError(expression, errorMsg);
    }
  }

  public derivative(expression: string, variable: string = 'x'): string {
    try {
      const d = derivative(expression, variable);
      return d.toString();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      throw new InvalidExpressionError(expression, `Error calculando derivada simbólica: ${errorMsg}`);
    }
  }

  public evaluateDerivative(expression: string, x: number, variable: string = 'x'): number {
    const derivedExpr = this.derivative(expression, variable);
    return this.evaluate(derivedExpr, x);
  }

  public validate(expression: string, variable: string = 'x'): { isValid: boolean; error?: string } {
    if (!expression || expression.trim() === '') {
      return { isValid: false, error: 'La función no puede estar vacía.' };
    }
    try {
      parse(expression);
      const compiled = compile(expression) as EvalFunction;
      const testVal = compiled.evaluate({ [variable]: 1, e: Math.E, pi: Math.PI, E: Math.E, PI: Math.PI });
      if (typeof testVal !== 'number' || Number.isNaN(testVal)) {
        return { isValid: false, error: 'La expresión no evalúa en un número real.' };
      }
      return { isValid: true };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { isValid: false, error: errorMsg };
    }
  }

  public formatForGraph(expression: string): string {
    return expression.trim();
  }
}
