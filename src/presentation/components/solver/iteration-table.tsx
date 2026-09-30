import React, { useState } from 'react';
import type { MethodResult } from '@/core/domain/entities/method-result';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Download, Table as TableIcon, Hash, Info } from 'lucide-react';

interface IterationTableProps {
  result: MethodResult;
}

export const IterationTable: React.FC<IterationTableProps> = ({ result }) => {
  const [precision, setPrecision] = useState<number>(6);
  const { history, method } = result;

  const formatNum = (num?: number) => {
    if (num === undefined || isNaN(num)) return '-';
    if (Math.abs(num) < 1e-4 && Math.abs(num) > 0) {
      return num.toExponential(4);
    }
    return num.toFixed(precision);
  };

  // Función de exportación a CSV con nombres claros y descriptivos
  const handleExportCSV = () => {
    if (!history.length) return;

    let headers: string[] = [];
    let rows: string[][] = [];

    if (method === 'bisection') {
      headers = [
        'Iteración (k)',
        'Límite Inferior (a_k)',
        'Límite Superior (b_k)',
        'Punto Medio / Raíz (c_k)',
        'Evaluación f(a_k)',
        'Evaluación f(b_k)',
        'Evaluación f(c_k)',
        'Error Absoluto (|c_k - c_{k-1}|)',
        'Error Relativo Porcentual (ε_a %)',
      ];
      rows = history.map((step) => [
        step.iteration.toString(),
        step.intervalA?.toString() ?? '',
        step.intervalB?.toString() ?? '',
        step.currentX.toString(),
        step.fa?.toString() ?? '',
        step.fb?.toString() ?? '',
        step.functionValue.toString(),
        step.absoluteError.toString(),
        step.relativeErrorPercentage.toString(),
      ]);
    } else if (method === 'newton-raphson') {
      headers = [
        'Iteración (k)',
        'Aproximación Actual (x_k)',
        'Evaluación Función f(x_k)',
        "Evaluación Derivada f'(x_k)",
        'Error Absoluto (|x_k - x_{k-1}|)',
        'Error Relativo Porcentual (ε_a %)',
      ];
      rows = history.map((step) => [
        step.iteration.toString(),
        step.currentX.toString(),
        step.functionValue.toString(),
        step.derivativeValue?.toString() ?? '',
        step.absoluteError.toString(),
        step.relativeErrorPercentage.toString(),
      ]);
    } else {
      // Fixed Point
      headers = [
        'Iteración (k)',
        'Valor Actual (x_k)',
        'Siguiente Estimación g(x_k)',
        'Residuo Función f(x_k)',
        'Error Absoluto (|x_{k+1} - x_k|)',
        'Error Relativo Porcentual (ε_a %)',
      ];
      rows = history.map((step) => [
        step.iteration.toString(),
        step.currentX.toString(),
        step.gxValue?.toString() ?? '',
        step.functionValue.toString(),
        step.absoluteError.toString(),
        step.relativeErrorPercentage.toString(),
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `iteraciones_${method}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <TableIcon className="h-5 w-5 text-indigo-400" />
          <div>
            <CardTitle className="text-base font-semibold text-slate-100">
              Tabla Paso a Paso de Iteraciones
            </CardTitle>
            <p className="text-xs text-slate-400">Total de {history.length} pasos calculados</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de precisión */}
          <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-1 border border-slate-700/60 text-xs">
            <Hash className="h-3.5 w-3.5 text-slate-400 ml-1" />
            <span className="text-slate-400 mr-1 hidden sm:inline">Decimales:</span>
            {[4, 6, 8].map((p) => (
              <button
                key={p}
                onClick={() => setPrecision(p)}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors font-mono ${
                  precision === p ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 border-slate-700 hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>
        </div>
      </CardHeader>

      {/* Franja explicativa de la convención de columnas */}
      <div className="px-6 py-2 bg-slate-950/40 border-y border-slate-800/60 flex items-center gap-2 text-xs text-slate-400">
        <Info className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
        <span>
          {method === 'bisection' && (
            <>
              <strong>Bisección:</strong> Cada fila muestra el intervalo activo <code className="text-slate-300 font-mono">[aₖ, bₖ]</code>, el punto medio calculado <code className="text-indigo-300 font-mono">cₖ = (a+b)/2</code>, los signos de función y el error acumulado.
            </>
          )}
          {method === 'newton-raphson' && (
            <>
              <strong>Newton-Raphson:</strong> Cada fila evalúa el punto actual <code className="text-indigo-300 font-mono">xₖ</code>, la función <code className="text-slate-300 font-mono">f(xₖ)</code> y la pendiente de la recta tangente <code className="text-slate-300 font-mono">f'(xₖ)</code>.
            </>
          )}
          {method === 'fixed-point' && (
            <>
              <strong>Punto Fijo:</strong> Cada fila evalúa el punto actual <code className="text-indigo-300 font-mono">xₖ</code>, la función iteradora <code className="text-emerald-300 font-mono">g(xₖ)</code> y el residuo <code className="text-slate-300 font-mono">f(xₖ)</code>.
            </>
          )}
        </span>
      </div>

      <CardContent className="p-0">
        <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-950/90 sticky top-0 z-10 border-b border-slate-800 text-slate-300">
              <tr>
                {/* Columna Iteración */}
                <th className="py-3 px-3 text-center w-14 border-r border-slate-800/60 bg-slate-950">
                  <div className="flex flex-col items-center">
                    <span className="font-semibold text-slate-200">Paso</span>
                    <span className="font-mono text-[10px] text-slate-400 font-normal">k</span>
                  </div>
                </th>

                {/* Columnas específicas para Bisección */}
                {method === 'bisection' && (
                  <>
                    <th className="py-3 px-3 border-r border-slate-800/60 bg-slate-950">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">Límite Inferior</span>
                        <span className="font-mono text-[10px] text-slate-400 font-normal">aₖ</span>
                      </div>
                    </th>
                    <th className="py-3 px-3 border-r border-slate-800/60 bg-slate-950">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">Límite Superior</span>
                        <span className="font-mono text-[10px] text-slate-400 font-normal">bₖ</span>
                      </div>
                    </th>
                    <th className="py-3 px-3 border-r border-slate-800/60 bg-indigo-950/30">
                      <div className="flex flex-col">
                        <span className="font-bold text-indigo-200">Punto Medio (Raíz)</span>
                        <span className="font-mono text-[10px] text-indigo-400 font-normal">cₖ = (a+b)/2</span>
                      </div>
                    </th>
                    <th className="py-3 px-3 border-r border-slate-800/60 bg-slate-950">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">Eval. Inferior</span>
                        <span className="font-mono text-[10px] text-slate-400 font-normal">f(aₖ)</span>
                      </div>
                    </th>
                    <th className="py-3 px-3 border-r border-slate-800/60 bg-slate-950">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">Eval. Superior</span>
                        <span className="font-mono text-[10px] text-slate-400 font-normal">f(bₖ)</span>
                      </div>
                    </th>
                    <th className="py-3 px-3 border-r border-slate-800/60 bg-slate-950">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">Eval. Raíz</span>
                        <span className="font-mono text-[10px] text-slate-400 font-normal">f(cₖ)</span>
                      </div>
                    </th>
                  </>
                )}

                {/* Columnas específicas para Newton-Raphson */}
                {method === 'newton-raphson' && (
                  <>
                    <th className="py-3 px-3 border-r border-slate-800/60 bg-indigo-950/30">
                      <div className="flex flex-col">
                        <span className="font-bold text-indigo-200">Aproximación Actual</span>
                        <span className="font-mono text-[10px] text-indigo-400 font-normal">xₖ</span>
                      </div>
                    </th>
                    <th className="py-3 px-3 border-r border-slate-800/60 bg-slate-950">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">Valor de Función</span>
                        <span className="font-mono text-[10px] text-slate-400 font-normal">f(xₖ)</span>
                      </div>
                    </th>
                    <th className="py-3 px-3 border-r border-slate-800/60 bg-slate-950">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">Pendiente / Derivada</span>
                        <span className="font-mono text-[10px] text-slate-400 font-normal">f'(xₖ)</span>
                      </div>
                    </th>
                  </>
                )}

                {/* Columnas específicas para Punto Fijo */}
                {method === 'fixed-point' && (
                  <>
                    <th className="py-3 px-3 border-r border-slate-800/60 bg-indigo-950/30">
                      <div className="flex flex-col">
                        <span className="font-bold text-indigo-200">Valor Actual</span>
                        <span className="font-mono text-[10px] text-indigo-400 font-normal">xₖ</span>
                      </div>
                    </th>
                    <th className="py-3 px-3 border-r border-slate-800/60 bg-emerald-950/30">
                      <div className="flex flex-col">
                        <span className="font-bold text-emerald-200">Siguiente Estimación</span>
                        <span className="font-mono text-[10px] text-emerald-400 font-normal">g(xₖ)</span>
                      </div>
                    </th>
                    <th className="py-3 px-3 border-r border-slate-800/60 bg-slate-950">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">Residuo de Función</span>
                        <span className="font-mono text-[10px] text-slate-400 font-normal">f(xₖ)</span>
                      </div>
                    </th>
                  </>
                )}

                {/* Columnas comunes de Error */}
                <th className="py-3 px-3 border-r border-slate-800/60 bg-slate-950">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-200">Error Absoluto</span>
                    <span className="font-mono text-[10px] text-slate-400 font-normal">|xₖ - xₖ₋₁|</span>
                  </div>
                </th>
                <th className="py-3 px-3 bg-amber-950/20">
                  <div className="flex flex-col">
                    <span className="font-bold text-amber-200">Error Relativo</span>
                    <span className="font-mono text-[10px] text-amber-400 font-normal">εₐ (%)</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono">
              {history.map((step, idx) => (
                <tr
                  key={step.iteration}
                  className={`hover:bg-slate-800/50 transition-colors ${
                    idx === history.length - 1 ? 'bg-indigo-950/20 font-semibold' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 text-center text-slate-400 border-r border-slate-800/60">
                    {step.iteration}
                  </td>
                  {method === 'bisection' && (
                    <>
                      <td className="py-2.5 px-3 border-r border-slate-800/60 text-slate-300">
                        {formatNum(step.intervalA)}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-800/60 text-slate-300">
                        {formatNum(step.intervalB)}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-800/60 text-indigo-300 font-bold bg-indigo-950/10">
                        {formatNum(step.currentX)}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-800/60 text-slate-400">
                        {formatNum(step.fa)}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-800/60 text-slate-400">
                        {formatNum(step.fb)}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-800/60 text-slate-300">
                        {formatNum(step.functionValue)}
                      </td>
                    </>
                  )}
                  {method === 'newton-raphson' && (
                    <>
                      <td className="py-2.5 px-3 border-r border-slate-800/60 text-indigo-300 font-bold bg-indigo-950/10">
                        {formatNum(step.currentX)}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-800/60 text-slate-300">
                        {formatNum(step.functionValue)}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-800/60 text-slate-400">
                        {formatNum(step.derivativeValue)}
                      </td>
                    </>
                  )}
                  {method === 'fixed-point' && (
                    <>
                      <td className="py-2.5 px-3 border-r border-slate-800/60 text-indigo-300 font-bold bg-indigo-950/10">
                        {formatNum(step.currentX)}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-800/60 text-emerald-300 font-bold bg-emerald-950/10">
                        {formatNum(step.gxValue)}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-800/60 text-slate-300">
                        {formatNum(step.functionValue)}
                      </td>
                    </>
                  )}
                  <td className="py-2.5 px-3 border-r border-slate-800/60 text-slate-400">
                    {formatNum(step.absoluteError)}
                  </td>
                  <td className="py-2.5 px-3 text-amber-300 font-semibold bg-amber-950/10">
                    {step.relativeErrorPercentage < 1e-4
                      ? step.relativeErrorPercentage.toExponential(3) + '%'
                      : `${step.relativeErrorPercentage.toFixed(precision)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

