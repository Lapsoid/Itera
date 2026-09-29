import React, { useState, useEffect } from 'react';
import type { NumericalMethodType } from '@/core/domain/entities/method-result';
import type { IMathEvaluator } from '@/core/domain/ports/math-evaluator.port';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Play, RotateCcw, Lightbulb, Calculator, HelpCircle } from 'lucide-react';

interface SolverFormProps {
  method: NumericalMethodType;
  mathEvaluator: IMathEvaluator;
  loading: boolean;
  onSolveBisection: (params: {
    expression: string;
    a: number;
    b: number;
    tolerance: number;
    maxIterations: number;
    errorType: 'relative' | 'absolute';
  }) => void;
  onSolveNewtonRaphson: (params: {
    expressionF: string;
    expressionDf?: string;
    x0: number;
    tolerance: number;
    maxIterations: number;
    errorType: 'relative' | 'absolute';
  }) => void;
  onSolveFixedPoint: (params: {
    expressionF?: string;
    expressionG: string;
    x0: number;
    tolerance: number;
    maxIterations: number;
    errorType: 'relative' | 'absolute';
  }) => void;
  onClear: () => void;
  onStateChange: (state: {
    expression: string;
    secondaryExpression?: string;
    intervalA?: number;
    intervalB?: number;
    initialX?: number;
  }) => void;
}

export const SolverForm: React.FC<SolverFormProps> = ({
  method,
  mathEvaluator,
  loading,
  onSolveBisection,
  onSolveNewtonRaphson,
  onSolveFixedPoint,
  onClear,
  onStateChange,
}) => {
  // Estados para Bisección
  const [exprF, setExprF] = useState('x^3 - x - 2');
  const [intervalA, setIntervalA] = useState('1');
  const [intervalB, setIntervalB] = useState('2');

  // Estados para Newton-Raphson
  const [newtonF, setNewtonF] = useState('exp(-x) - x');
  const [newtonDf, setNewtonDf] = useState('');
  const [newtonX0, setNewtonX0] = useState('0');

  // Estados para Punto Fijo
  const [fixedF, setFixedF] = useState('cos(x) - x');
  const [fixedG, setFixedG] = useState('cos(x)');
  const [fixedX0, setFixedX0] = useState('0.5');

  // Parámetros comunes
  const [tolerance, setTolerance] = useState('0.0001');
  const [maxIterations, setMaxIterations] = useState('50');
  const [errorType, setErrorType] = useState<'relative' | 'absolute'>('relative');

  // Errores de validación de sintaxis en tiempo real
  const [syntaxError, setSyntaxError] = useState<string | null>(null);

  // Sincronizar estado con el canvas de graficación
  useEffect(() => {
    if (method === 'bisection') {
      const aNum = parseFloat(intervalA);
      const bNum = parseFloat(intervalB);
      onStateChange({
        expression: exprF,
        intervalA: !isNaN(aNum) ? aNum : undefined,
        intervalB: !isNaN(bNum) ? bNum : undefined,
      });
    } else if (method === 'newton-raphson') {
      const x0Num = parseFloat(newtonX0);
      onStateChange({
        expression: newtonF,
        secondaryExpression: newtonDf,
        initialX: !isNaN(x0Num) ? x0Num : undefined,
      });
    } else if (method === 'fixed-point') {
      const x0Num = parseFloat(fixedX0);
      onStateChange({
        expression: fixedF || 'x - (' + fixedG + ')',
        secondaryExpression: fixedG,
        initialX: !isNaN(x0Num) ? x0Num : undefined,
      });
    }
  }, [method, exprF, intervalA, intervalB, newtonF, newtonDf, newtonX0, fixedF, fixedG, fixedX0, onStateChange]);

  // Derivada simbólica automática para Newton
  const handleAutoDerivative = () => {
    try {
      const derived = mathEvaluator.derivative(newtonF);
      setNewtonDf(derived);
      setSyntaxError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSyntaxError(`Error al derivar simbólicamente: ${msg}`);
    }
  };

  // Cargar ejemplos predefinidos
  const handleLoadExample = () => {
    if (method === 'bisection') {
      setExprF('x^3 - x - 2');
      setIntervalA('1');
      setIntervalB('2');
      setTolerance('0.0001');
      setMaxIterations('50');
    } else if (method === 'newton-raphson') {
      setNewtonF('exp(-x) - x');
      setNewtonDf('-exp(-x) - 1');
      setNewtonX0('0');
      setTolerance('0.00001');
      setMaxIterations('30');
    } else if (method === 'fixed-point') {
      setFixedF('cos(x) - x');
      setFixedG('cos(x)');
      setFixedX0('0.5');
      setTolerance('0.00001');
      setMaxIterations('50');
    }
    setSyntaxError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSyntaxError(null);

    const tolNum = parseFloat(tolerance);
    const maxIterNum = parseInt(maxIterations, 10);

    if (isNaN(tolNum) || tolNum <= 0) {
      setSyntaxError('La tolerancia debe ser un número positivo mayor que 0.');
      return;
    }
    if (isNaN(maxIterNum) || maxIterNum <= 0) {
      setSyntaxError('El número máximo de iteraciones debe ser un entero positivo.');
      return;
    }

    if (method === 'bisection') {
      const val = mathEvaluator.validate(exprF);
      if (!val.isValid) {
        setSyntaxError(`Error en f(x): ${val.error}`);
        return;
      }
      const a = parseFloat(intervalA);
      const b = parseFloat(intervalB);
      if (isNaN(a) || isNaN(b)) {
        setSyntaxError('Los límites del intervalo a y b deben ser números válidos.');
        return;
      }
      onSolveBisection({
        expression: exprF,
        a,
        b,
        tolerance: tolNum,
        maxIterations: maxIterNum,
        errorType,
      });
    } else if (method === 'newton-raphson') {
      const valF = mathEvaluator.validate(newtonF);
      if (!valF.isValid) {
        setSyntaxError(`Error en f(x): ${valF.error}`);
        return;
      }
      if (newtonDf.trim()) {
        const valDf = mathEvaluator.validate(newtonDf);
        if (!valDf.isValid) {
          setSyntaxError(`Error en f'(x): ${valDf.error}`);
          return;
        }
      }
      const x0 = parseFloat(newtonX0);
      if (isNaN(x0)) {
        setSyntaxError('El valor inicial x₀ debe ser un número válido.');
        return;
      }
      onSolveNewtonRaphson({
        expressionF: newtonF,
        expressionDf: newtonDf.trim() ? newtonDf : undefined,
        x0,
        tolerance: tolNum,
        maxIterations: maxIterNum,
        errorType,
      });
    } else if (method === 'fixed-point') {
      const valG = mathEvaluator.validate(fixedG);
      if (!valG.isValid) {
        setSyntaxError(`Error en g(x): ${valG.error}`);
        return;
      }
      if (fixedF.trim()) {
        const valF = mathEvaluator.validate(fixedF);
        if (!valF.isValid) {
          setSyntaxError(`Error en f(x): ${valF.error}`);
          return;
        }
      }
      const x0 = parseFloat(fixedX0);
      if (isNaN(x0)) {
        setSyntaxError('El valor inicial x₀ debe ser un número válido.');
        return;
      }
      onSolveFixedPoint({
        expressionF: fixedF.trim() ? fixedF : undefined,
        expressionG: fixedG,
        x0,
        tolerance: tolNum,
        maxIterations: maxIterNum,
        errorType,
      });
    }
  };

  return (
    <Card className="border-slate-800 bg-slate-900/90 shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Calculator className="h-4 w-4 text-indigo-400" />
            Configuración y Parámetros
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">Introduce las funciones y cotas de evaluación</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLoadExample}
            title="Cargar ejemplo recomendado"
            className="text-xs gap-1.5"
          >
            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Ejemplo</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClear}
            title="Limpiar resultados"
            className="text-xs gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Limpiar</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Formulario específico para Bisección */}
          {method === 'bisection' && (
            <div className="space-y-4">
              <div>
                <Input
                  label="Función f(x)"
                  value={exprF}
                  onChange={(e) => setExprF(e.target.value)}
                  placeholder="ej. x^3 - x - 2, cos(x) - x"
                  helperText="Usa operadores como +, -, *, /, ^ y funciones como sin, cos, exp, log."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Límite Inferior (a)"
                  type="number"
                  step="any"
                  value={intervalA}
                  onChange={(e) => setIntervalA(e.target.value)}
                  placeholder="ej. 1"
                  required
                />
                <Input
                  label="Límite Superior (b)"
                  type="number"
                  step="any"
                  value={intervalB}
                  onChange={(e) => setIntervalB(e.target.value)}
                  placeholder="ej. 2"
                  required
                />
              </div>
            </div>
          )}

          {/* Formulario específico para Newton-Raphson */}
          {method === 'newton-raphson' && (
            <div className="space-y-4">
              <div>
                <Input
                  label="Función f(x)"
                  value={newtonF}
                  onChange={(e) => setNewtonF(e.target.value)}
                  placeholder="ej. exp(-x) - x"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Derivada f'(x) (Opcional)
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoDerivative}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
                  >
                    Calcular Derivada Simbólica Automáticamente
                  </button>
                </div>
                <Input
                  value={newtonDf}
                  onChange={(e) => setNewtonDf(e.target.value)}
                  placeholder="Dejar vacío para cálculo automático mediante mathjs"
                  helperText="Si se deja vacío, el sistema la derivará analíticamente."
                />
              </div>

              <div>
                <Input
                  label="Valor Inicial (x₀)"
                  type="number"
                  step="any"
                  value={newtonX0}
                  onChange={(e) => setNewtonX0(e.target.value)}
                  placeholder="ej. 0"
                  required
                />
              </div>
            </div>
          )}

          {/* Formulario específico para Punto Fijo */}
          {method === 'fixed-point' && (
            <div className="space-y-4">
              <div>
                <Input
                  label="Función Iterativa g(x) [tal que x = g(x)]"
                  value={fixedG}
                  onChange={(e) => setFixedG(e.target.value)}
                  placeholder="ej. cos(x), sqrt(10 / (x + 4))"
                  helperText="Esta es la función que se evalúa repetidamente: x_(k+1) = g(x_k)"
                  required
                />
              </div>

              <div>
                <Input
                  label="Función f(x) Original (Opcional)"
                  value={fixedF}
                  onChange={(e) => setFixedF(e.target.value)}
                  placeholder="ej. cos(x) - x"
                  helperText="Opcional: Sirve para graficar la raíz y verificar f(x) = 0."
                />
              </div>

              <div>
                <Input
                  label="Valor Inicial (x₀)"
                  type="number"
                  step="any"
                  value={fixedX0}
                  onChange={(e) => setFixedX0(e.target.value)}
                  placeholder="ej. 0.5"
                  required
                />
              </div>
            </div>
          )}

          {/* Parámetros de convergencia comunes */}
          <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Tolerancia (ε)"
              type="number"
              step="any"
              value={tolerance}
              onChange={(e) => setTolerance(e.target.value)}
              placeholder="0.0001"
              required
            />
            <Input
              label="Máx Iteraciones (N)"
              type="number"
              min="1"
              max="5000"
              value={maxIterations}
              onChange={(e) => setMaxIterations(e.target.value)}
              placeholder="50"
              required
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Criterio de Error
              </label>
              <select
                value={errorType}
                onChange={(e) => setErrorType(e.target.value as 'relative' | 'absolute')}
                className="flex h-10 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="relative">Relativo Porcentual (%)</option>
                <option value="absolute">Absoluto (|x_k - x_(k-1)|)</option>
              </select>
            </div>
          </div>

          {syntaxError && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/60 text-red-300 text-xs flex items-center gap-2">
              <HelpCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{syntaxError}</span>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full h-11 text-base gap-2 font-semibold">
            <Play className="h-4 w-4 fill-white" />
            {loading ? 'Calculando Iteraciones...' : 'Ejecutar Solucionador'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
