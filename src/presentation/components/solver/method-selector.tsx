import React from 'react';
import type { NumericalMethodType } from '@/core/domain/entities/method-result';
import { GitCommit, TrendingDown, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MethodSelectorProps {
  currentMethod: NumericalMethodType;
  onSelectMethod: (method: NumericalMethodType) => void;
}

export const MethodSelector: React.FC<MethodSelectorProps> = ({ currentMethod, onSelectMethod }) => {
  const methods = [
    {
      id: 'bisection' as const,
      name: 'Método de Bisección',
      short: 'Bisección',
      badge: 'Cerrado / Bracketing',
      desc: 'Método de partición binaria basado en el Teorema de Bolzano. Convergencia siempre garantizada.',
      icon: GitCommit,
    },
    {
      id: 'newton-raphson' as const,
      name: 'Método de Newton-Raphson',
      short: 'Newton-Raphson',
      badge: 'Abierto / Tangente',
      desc: 'Método de convergencia cuadrática mediante extrapolación por rectas tangentes a la curva.',
      icon: TrendingDown,
    },
    {
      id: 'fixed-point' as const,
      name: 'Método de Punto Fijo',
      short: 'Punto Fijo',
      badge: 'Abierto / Iterativo',
      desc: 'Transforma f(x) = 0 en la forma x = g(x). Converge si |g\'(x)| < 1 en el entorno de la raíz.',
      icon: Target,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {methods.map((m) => {
        const Icon = m.icon;
        const isSelected = currentMethod === m.id;

        return (
          <button
            key={m.id}
            onClick={() => onSelectMethod(m.id)}
            className={cn(
              'flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group',
              isSelected
                ? 'bg-slate-800/90 border-indigo-500/80 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
            )}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  'text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                  isSelected
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                )}
              >
                {m.badge}
              </span>
            </div>

            <h3 className="font-semibold text-sm text-white mb-1">{m.name}</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">{m.desc}</p>
          </button>
        );
      })}
    </div>
  );
};
