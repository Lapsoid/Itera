import { describe, it, expect } from 'vitest';
import functionPlot from 'function-plot';
import { resolveFunctionPlot } from '../function-plot-resolver';

describe('resolveFunctionPlot', () => {
  it('debe resolver la función callable a partir del módulo real de function-plot', () => {
    const fn = resolveFunctionPlot(functionPlot);
    expect(fn).toBeDefined();
    expect(typeof fn).toBe('function');
  });

  it('debe retornar la función directamente si el input ya es una función', () => {
    const mockFn = () => {};
    expect(resolveFunctionPlot(mockFn)).toBe(mockFn);
  });

  it('debe extraer la función desde la propiedad default', () => {
    const mockFn = () => {};
    expect(resolveFunctionPlot({ default: mockFn })).toBe(mockFn);
  });

  it('debe extraer la función desde default anidado (default.default)', () => {
    const mockFn = () => {};
    expect(resolveFunctionPlot({ default: { default: mockFn } })).toBe(mockFn);
  });

  it('debe retornar null si el módulo no contiene una función válida', () => {
    expect(resolveFunctionPlot({})).toBeNull();
    expect(resolveFunctionPlot(null)).toBeNull();
    expect(resolveFunctionPlot(undefined)).toBeNull();
    expect(resolveFunctionPlot({ default: 'not-a-function' })).toBeNull();
  });
});
