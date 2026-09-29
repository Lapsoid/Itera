export interface IMathEvaluator {
  /**
   * Evalúa la función f(x) en un punto numérico dado.
   */
  evaluate(expression: string, x: number): number;

  /**
   * Calcula la derivada simbólica d/dx de la expresión.
   */
  derivative(expression: string, variable?: string): string;

  /**
   * Evalúa la derivada de la función en el punto x.
   */
  evaluateDerivative(expression: string, x: number, variable?: string): number;

  /**
   * Valida sintácticamente la expresión matemática.
   */
  validate(expression: string, variable?: string): { isValid: boolean; error?: string };

  /**
   * Convierte la expresión a formato compatible con graficadores si es necesario.
   */
  formatForGraph(expression: string): string;
}
