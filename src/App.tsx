import { useState } from 'react';
import { Header } from '@/presentation/components/layout/header';
import { MethodSelector } from '@/presentation/components/solver/method-selector';
import { SolverForm } from '@/presentation/components/solver/solver-form';
import { FunctionPlotCanvas } from '@/presentation/components/graph/function-plot-canvas';
import { SummaryCard } from '@/presentation/components/solver/summary-card';
import { IterationTable } from '@/presentation/components/solver/iteration-table';
import { Alert } from '@/presentation/components/ui/alert';
import { useSolver } from '@/presentation/hooks/use-solver';

export function App() {
  const {
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
  } = useSolver();

  // Estado sincronizado para la gráfica
  const [graphState, setGraphState] = useState<{
    expression: string;
    secondaryExpression?: string;
    intervalA?: number;
    intervalB?: number;
    initialX?: number;
  }>({
    expression: 'x^3 - x - 2',
    intervalA: 1,
    intervalB: 2,
  });

  const handleMethodChange = (newMethod: typeof currentMethod) => {
    setCurrentMethod(newMethod);
    clear();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Barra de Navegación / Header */}
      <Header />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Selector de Método Numérico */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              Selecciona el Método Numérico
            </h2>
          </div>
          <MethodSelector currentMethod={currentMethod} onSelectMethod={handleMethodChange} />
        </section>

        {/* Sección de Entrada y Graficación */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Formulario de Parámetros */}
          <div className="lg:col-span-5 w-full">
            <SolverForm
              method={currentMethod}
              mathEvaluator={mathEvaluator}
              loading={loading}
              onSolveBisection={executeBisection}
              onSolveNewtonRaphson={executeNewtonRaphson}
              onSolveFixedPoint={executeFixedPoint}
              onClear={clear}
              onStateChange={setGraphState}
            />
          </div>

          {/* Gráfico 2D Interactivo */}
          <div className="lg:col-span-7 w-full">
            <FunctionPlotCanvas
              method={currentMethod}
              expression={graphState.expression}
              secondaryExpression={graphState.secondaryExpression}
              result={result}
              intervalA={graphState.intervalA}
              intervalB={graphState.intervalB}
              initialX={graphState.initialX}
            />
          </div>
        </section>

        {/* Mensaje de Error / Excepción de Dominio */}
        {error && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-300">
            <Alert variant="destructive" title="Error en el Cálculo Numérico">
              {error}
            </Alert>
          </section>
        )}

        {/* Resultados del Método: Resumen y Tabla */}
        {result && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Tarjeta de Resumen */}
            <SummaryCard result={result} />

            {/* Tabla Detallada Paso a Paso */}
            <IterationTable result={result} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 bg-slate-950 text-center text-xs text-slate-500">
        <p>Proyecto de Análisis Numérico • Solucionador de Ecuaciones No Lineales</p>
      </footer>
    </div>
  );
}

export default App;
