export class NumericalMethodError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NumericalMethodError';
  }
}

export class BolzanoViolationError extends NumericalMethodError {
  public readonly fa: number;
  public readonly fb: number;
  public readonly a: number;
  public readonly b: number;

  constructor(fa: number, fb: number, a: number, b: number) {
    super(
      `Violación del Teorema de Bolzano: f(a) = ${fa.toFixed(6)} y f(b) = ${fb.toFixed(6)} tienen el mismo signo en el intervalo [${a}, ${b}]. No se garantiza la existencia de una raíz.`
    );
    this.name = 'BolzanoViolationError';
    this.fa = fa;
    this.fb = fb;
    this.a = a;
    this.b = b;
  }
}

export class ZeroDerivativeError extends NumericalMethodError {
  public readonly x: number;
  public readonly derivativeValue: number;

  constructor(x: number, derivativeValue: number) {
    super(
      `Derivada nula o casi nula detectada en x = ${x.toFixed(6)} (f'(x) = ${derivativeValue.toExponential(4)}). Riesgo de división por cero o tangente horizontal.`
    );
    this.name = 'ZeroDerivativeError';
    this.x = x;
    this.derivativeValue = derivativeValue;
  }
}

export class DivergenceError extends NumericalMethodError {
  public readonly iteration: number;
  public readonly x: number;

  constructor(iteration: number, x: number, details?: string) {
    super(
      `El método divergió en la iteración ${iteration} (x = ${x}). ${details || 'Los valores se desbordan o no convergen hacia una raíz.'}`
    );
    this.name = 'DivergenceError';
    this.iteration = iteration;
    this.x = x;
  }
}

export class InvalidExpressionError extends NumericalMethodError {
  public readonly expression: string;
  public readonly originalError?: string;

  constructor(expression: string, originalError?: string) {
    super(`Expresión matemática inválida "${expression}": ${originalError || 'Error de sintaxis o variable no permitida.'}`);
    this.name = 'InvalidExpressionError';
    this.expression = expression;
    this.originalError = originalError;
  }
}

export class InvalidIntervalError extends NumericalMethodError {
  public readonly a: number;
  public readonly b: number;

  constructor(a: number, b: number) {
    super(`Intervalo inválido [${a}, ${b}]: El límite inferior 'a' debe ser menor estricto que el límite superior 'b'.`);
    this.name = 'InvalidIntervalError';
    this.a = a;
    this.b = b;
  }
}
