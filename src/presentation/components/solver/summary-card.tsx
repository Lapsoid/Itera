import React from 'react';
import type { MethodResult } from '@/core/domain/entities/method-result';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { CheckCircle2, Clock, Zap, Target, AlertCircle } from 'lucide-react';

interface SummaryCardProps {
  result: MethodResult;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ result }) => {
  const isBisection = result.method === 'bisection';
  const isNewton = result.method === 'newton-raphson';

  const methodTitle = isBisection
    ? 'Método de Bisección'
    : isNewton
    ? 'Método de Newton-Raphson'
    : 'Método de Punto Fijo';

  return (
    <Card className="border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 shadow-2xl">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
                Resumen de Ejecución
              </span>
              <Badge variant={result.converged ? 'success' : 'warning'}>
                {result.converged ? 'Convergencia Exitosa' : 'Límite de Iteraciones'}
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{methodTitle}</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              <span>{result.executionTimeMs.toFixed(2)} ms</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>{result.iterationsCount} iteraciones</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800/80">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-1">
              <Target className="h-3.5 w-3.5 text-emerald-400" />
              Raíz Calculada (x*)
            </span>
            <div className="text-2xl font-mono font-bold text-emerald-300 tracking-tight">
              {Number.isFinite(result.root) ? result.root.toFixed(8) : 'Indeterminada'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800/80">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
              Error Estimado Final
            </span>
            <div className="text-2xl font-mono font-bold text-indigo-300 tracking-tight">
              {result.finalError < 1e-4
                ? result.finalError.toExponential(4)
                : `${result.finalError.toFixed(6)}%`}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800/80">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-1">
              <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
              Criterio de Paro
            </span>
            <div className="text-sm font-semibold text-slate-200 mt-1 capitalize">
              {result.stoppedBy === 'tolerance' && 'Tolerancia alcanzada'}
              {result.stoppedBy === 'exact_root' && 'Raíz exacta hallada f(x) = 0'}
              {result.stoppedBy === 'max_iterations' && 'Máx. iteraciones alcanzadas'}
              {result.stoppedBy === 'stagnation' && 'Estancamiento de valores'}
            </div>
          </div>
        </div>

        {result.message && (
          <p className="mt-4 text-xs text-slate-400 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
            Nota: {result.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
