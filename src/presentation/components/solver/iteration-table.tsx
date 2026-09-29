import React, { useState } from 'react';
import type { MethodResult } from '@/core/domain/entities/method-result';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Download, Table as TableIcon, Hash } from 'lucide-react';

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

  // Función de exportación a CSV
  const handleExportCSV = () => {
    if (!history.length) return;

    let headers: string[] = [];
    let rows: string[][] = [];

    if (method === 'bisection') {
      headers = ['Iteración', 'a', 'b', 'c (Raíz)', 'f(a)', 'f(b)', 'f(c)', 'Error Absoluto', 'Error Relativo (%)'];
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
      headers = ['Iteración', 'x_k', 'f(x_k)', "f'(x_k)", 'x_(k+1)', 'Error Absoluto', 'Error Relativo (%)'];
      rows = history.map((step) => [
        step.iteration.toString(),
        step.currentX.toString(),
        step.functionValue.toString(),
        step.derivativeValue?.toString() ?? '',
        (step.previousX ?? step.currentX).toString(),
        step.absoluteError.toString(),
        step.relativeErrorPercentage.toString(),
      ]);
    } else {
      // Fixed Point
      headers = ['Iteración', 'x_k', 'g(x_k)', 'f(x_k)', 'Error Absoluto', 'Error Relativo (%)'];
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

      <CardContent className="p-0">
        <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-950/80 sticky top-0 z-10 border-b border-slate-800 text-slate-300 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-3 text-center w-12 border-r border-slate-800/60">k</th>
                {method === 'bisection' && (
                  <>
                    <th className="py-3 px-3 border-r border-slate-800/60 font-mono">a_k</th>
                    <th className="py-3 px-3 border-r border-slate-800/60 font-mono">b_k</th>
                    <th className="py-3 px-3 border-r border-slate-800/60 font-mono text-indigo-300">c_k (Raíz)</th>
                    <th className="py-3 px-3 border-r border-slate-800/60 font-mono">f(a_k)</th>
                    <th className="py-3 px-3 border-r border-slate-800/60 font-mono">f(b_k)</th>
                    <th className="py-3 px-3 border-r border-slate-800/60 font-mono">f(c_k)</th>
                  </>
                )}
                {method === 'newton-raphson' && (
                  <>
                    <th className="py-3 px-3 border-r border-slate-800/60 font-mono text-indigo-300">x_k</th>
                    <th className="py-3 px-3 border-r border-slate-800/60 font-mono">f(x_k)</th>
                    <th className="py-3 px-3 border-r border-slate-800/60 font-mono">f'(x_k)</th>
                  </>
                )}
                {method === 'fixed-point' && (
                  <>
                    <th className="py-3 px-3 border-r border-slate-800/60 font-mono text-indigo-300">x_k</th>
                    <th className="py-3 px-3 border-r border-slate-800/60 font-mono text-emerald-300">g(x_k)</th>
                    <th className="py-3 px-3 border-r border-slate-800/60 font-mono">f(x_k)</th>
                  </>
                )}
                <th className="py-3 px-3 border-r border-slate-800/60 font-mono">Error Absoluto</th>
                <th className="py-3 px-3 font-mono text-amber-300">Error Relativo (%)</th>
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
                      <td className="py-2.5 px-3 border-r border-slate-800/60 text-indigo-300 font-bold">
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
                      <td className="py-2.5 px-3 border-r border-slate-800/60 text-indigo-300 font-bold">
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
                      <td className="py-2.5 px-3 border-r border-slate-800/60 text-indigo-300 font-bold">
                        {formatNum(step.currentX)}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-800/60 text-emerald-300 font-bold">
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
                  <td className="py-2.5 px-3 text-amber-300">
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
