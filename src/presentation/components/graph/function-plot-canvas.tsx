import React, { useEffect, useRef, useState, useCallback } from 'react';
import functionPlotModule from 'function-plot';
import type { NumericalMethodType, MethodResult } from '@/core/domain/entities/method-result';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Alert } from '../ui/alert';
import { Maximize2, RotateCcw } from 'lucide-react';

interface FunctionPlotCanvasProps {
  method: NumericalMethodType;
  expression: string;
  secondaryExpression?: string;
  result?: MethodResult | null;
  intervalA?: number;
  intervalB?: number;
  initialX?: number;
}

export const FunctionPlotCanvas: React.FC<FunctionPlotCanvasProps> = ({
  method,
  expression,
  secondaryExpression,
  result,
  intervalA,
  intervalB,
  initialX,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphError, setGraphError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 420 });
  const [refreshKey, setRefreshKey] = useState(0);

  // Ajuste responsivo de ancho
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const clientWidth = containerRef.current.clientWidth;
        setDimensions({
          width: Math.max(320, clientWidth - 20),
          height: 420,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleResetView = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !expression.trim()) return;

    try {
      containerRef.current.innerHTML = '';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dataPlots: any[] = [];

      // 1. Gráfica principal f(x)
      dataPlots.push({
        fn: expression,
        color: '#6366f1',
        graphType: 'polyline',
      });

      // 2. Gráficas adicionales según el método
      if (method === 'fixed-point') {
        dataPlots.push({
          fn: 'x',
          color: '#94a3b8',
          graphType: 'polyline',
          attr: { 'stroke-dasharray': '4,4' },
        });

        if (secondaryExpression) {
          dataPlots.push({
            fn: secondaryExpression,
            color: '#10b981',
            graphType: 'polyline',
          });
        }
      }

      // 3. Marcador de raíz hallada
      if (result && result.converged && Number.isFinite(result.root)) {
        dataPlots.push({
          points: [[result.root, 0]],
          fnType: 'points',
          graphType: 'scatter',
          color: '#f43f5e',
          attr: { r: 6 },
        });
      }

      // 4. Marcadores para Bisección [a, b]
      if (method === 'bisection' && intervalA !== undefined && intervalB !== undefined) {
        dataPlots.push({
          points: [
            [intervalA, 0],
            [intervalB, 0],
          ],
          fnType: 'points',
          graphType: 'scatter',
          color: '#eab308',
          attr: { r: 5 },
        });
      }

      // 5. Punto inicial x0
      if (initialX !== undefined && Number.isFinite(initialX)) {
        dataPlots.push({
          points: [[initialX, 0]],
          fnType: 'points',
          graphType: 'scatter',
          color: '#06b6d4',
          attr: { r: 5 },
        });
      }

      // Rango centrado inteligente
      let xDomain: [number, number] = [-5, 5];
      let yDomain: [number, number] = [-5, 5];

      if (result && Number.isFinite(result.root)) {
        xDomain = [result.root - 4, result.root + 4];
        yDomain = [-6, 6];
      } else if (intervalA !== undefined && intervalB !== undefined) {
        const span = Math.max(1, Math.abs(intervalB - intervalA));
        xDomain = [intervalA - span * 0.5, intervalB + span * 0.5];
        yDomain = [-span * 2, span * 2];
      } else if (initialX !== undefined) {
        xDomain = [initialX - 4, initialX + 4];
        yDomain = [-6, 6];
      }

      // Resolver la función callable de function-plot:
      // Vite pre-bundlea el módulo CJS y re-exporta el objeto `exports` como default.
      // La función real está en `exports.default`, no en el objeto mismo.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fpModule = functionPlotModule as any;
      const plotFn = typeof fpModule === 'function'
        ? fpModule
        : typeof fpModule?.default === 'function'
          ? fpModule.default
          : null;
      if (!plotFn) {
        throw new Error(
          'No se pudo resolver la función de graficación function-plot. '
          + `typeof import = ${typeof fpModule}, keys = [${Object.keys(fpModule || {}).join(', ')}]`
        );
      }

      plotFn({
        target: containerRef.current,
        width: dimensions.width,
        height: dimensions.height,
        grid: true,
        xAxis: { domain: xDomain },
        yAxis: { domain: yDomain },
        data: dataPlots,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTimeout(() => {
        setGraphError(`No se pudo graficar la función: ${msg}`);
      }, 0);
    }
  }, [
    expression,
    secondaryExpression,
    result,
    dimensions,
    method,
    intervalA,
    intervalB,
    initialX,
    refreshKey,
  ]);

  return (
    <Card className="overflow-hidden border-slate-800 bg-slate-900/90 shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold text-slate-100">Visualización Gráfica</CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            {method === 'fixed-point'
              ? 'Azul: f(x) | Verde: g(x) | Gris punteado: y = x'
              : 'Azul: f(x) | Rojo: Raíz estimada | Amarillo: Intervalos/x₀'}
          </p>
        </div>
        <button
          onClick={handleResetView}
          title="Restablecer vista"
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-800/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="p-4 flex flex-col items-center justify-center">
        {graphError && (
          <Alert variant="warning" className="mb-4 w-full">
            {graphError}
          </Alert>
        )}
        <div
          ref={containerRef}
          className="w-full flex items-center justify-center overflow-hidden rounded-lg bg-slate-950/80 border border-slate-800/60 p-1"
          style={{ minHeight: '420px' }}
        />
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            Función f(x)
          </span>
          {method === 'fixed-point' && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              g(x)
            </span>
          )}
          {result?.converged && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Raíz: {result.root.toFixed(6)}
            </span>
          )}
          <span className="flex items-center gap-1 text-slate-500 ml-auto">
            <Maximize2 className="h-3.5 w-3.5" /> Rueda: zoom | Arrastre: mover
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
