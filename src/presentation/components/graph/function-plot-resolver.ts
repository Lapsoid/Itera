// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FunctionPlotFn = (options: any) => any;

/**
 * Resuelve la función callable de function-plot de manera segura
 * independientemente de cómo el empaquetador (Vite, Rollup, Webpack)
 * exponga el módulo CJS/UMD con __esModule.
 */
export function resolveFunctionPlot(rawModule: unknown): FunctionPlotFn | null {
  if (typeof rawModule === 'function') {
    return rawModule as FunctionPlotFn;
  }
  const obj = rawModule as Record<string, unknown>;
  if (typeof obj?.default === 'function') {
    return obj.default as FunctionPlotFn;
  }
  if (typeof (obj?.default as Record<string, unknown>)?.default === 'function') {
    return (obj.default as Record<string, unknown>).default as FunctionPlotFn;
  }
  return null;
}
