# AGENTS.md — Proyecto de Métodos Numéricos

Este documento recopila el contexto del proyecto, directrices operativas, arquitectura de software, especificaciones matemáticas y reglas de trabajo para los agentes de desarrollo.

---

## 1. Información General del Proyecto

- **Objetivo**: Desarrollar una aplicación web interactiva y moderna para resolver ecuaciones no lineales mediante métodos numéricos iterativos:
  1. **Método de Bisección**
  2. **Método de Punto Fijo**
  3. **Método de Newton-Raphson**
- **Enfoque de Calidad**: Implementación bajo principios de **Clean Architecture**, alta precisión de cálculo, validación estricta de condiciones de convergencia, visualización tabular paso a paso y graficación interactiva 2D.

---

## 2. Stack Tecnológico

| Capa / Función | Tecnología Seleccionada | Justificación / Rol |
| :--- | :--- | :--- |
| **Core / Framework** | **React + Vite + TypeScript** | Entorno rápido, tipado estricto para modelos matemáticos y reactividad eficiente. |
| **Evaluación Matemática** | **mathjs** | Parser y evaluador seguro de expresiones algebraicas y cálculo de derivadas simbólicas y numéricas. |
| **Graficación Matemática** | **function-plot** (con D3) | Renderizado interactivo 2D de funciones continuas, raíces, tangentes y delimitadores de intervalo. |
| **UI & Estilos** | **Tailwind CSS + shadcn/ui** | Componentes accesibles, minimalistas y diseño responsivo de alto nivel visual (tablas, formularios, tarjetas). |

---

## 3. Restricciones Operativas Críticas (Directivas del Usuario)

> [!CAUTION]
> **REGLAS OBLIGATORIAS DE EJECUCIÓN**:
> 1. **CERO INSTALACIONES SIN PERMISO**: No ejecutar comandos de instalación de paquetes de sistema (`pacman`, `apt`, etc.) ni gestores de paquetes (`npm install`, `pnpm add`, `bun`, `npx`) sin la **autorización previa y explícita del usuario**.
> 2. **NO TOCAR GIT**: No ejecutar comandos de control de versiones (`git init`, `git add`, `git commit`, `git checkout`, etc.) a menos que el usuario lo solicite expresamente.
> 3. **PLANIFICACIÓN PREVIA**: Antes de codificar o crear la estructura base del código, el usuario debe revisar y aprobar el plan detallado.

---

## 4. Arquitectura de Software: Clean Architecture

El proyecto se estructurará siguiendo la regla de dependencias (las capas internas no conocen a las capas externas):

```
src/
├── core/
│   ├── domain/                      # 1. Reglas de Negocio Empresariales / Dominio Puro
│   │   ├── entities/                # Modelos de datos (Iteracion, ResultadoMetodo, ParametrosEntrada)
│   │   ├── errors/                  # Errores de dominio (ConvergenciaError, IntervaloInvalidoError, DivisionPorCeroError)
│   │   └── ports/                   # Interfaces / Puertos (IEvaluadorMatematico, ISolucionadorNumerico)
│   │
│   └── application/                 # 2. Reglas de Negocio de la Aplicación / Casos de Uso
│       ├── use-cases/
│       │   ├── biseccion.usecase.ts
│       │   ├── punto-fijo.usecase.ts
│       │   └── newton-raphson.usecase.ts
│       └── dtos/                    # DTOs de entrada y salida para desacoplar la UI del dominio
│
├── infrastructure/                  # 3. Adaptadores y Motores Externos
│   ├── math/
│   │   └── mathjs-evaluador.adapter.ts   # Implementación del puerto IEvaluadorMatematico con mathjs
│   └── export/                      # Exportación a CSV / LaTeX / Reportes (opcional)
│
└── presentation/                    # 4. Interfaz de Usuario (React + Tailwind + shadcn/ui)
    ├── components/
    │   ├── ui/                      # Primitivas shadcn/ui (Button, Card, Input, Table, Tabs, Alert, etc.)
    │   ├── layout/                  # Header, Navbar, ThemeToggle, Contenedor principal
    │   ├── solver/
    │   │   ├── method-selector.tsx  # Selector de método numérico
    │   │   ├── solver-form.tsx      # Formulario dinámico según método
    │   │   ├── iteration-table.tsx  # Tabla detallada paso a paso
    │   │   └── summary-card.tsx     # Resumen de resultados (raíz hallada, error final, iteraciones)
    │   └── graph/
    │       └── function-plot-canvas.tsx # Adaptador React para la librería function-plot
    ├── hooks/
    │   └── use-solver.ts            # Hook para coordinar la ejecución del caso de uso
    └── App.tsx                      # Vista principal orquestadora
```

---

## 5. Especificaciones de los Métodos Numéricos

### A. Método de Bisección
- **Entradas**: f(x), intervalo [a, b], tolerancia ε, máximo de iteraciones N_max, criterio de paro (error relativo porcentual o |f(x)| < ε).
- **Validación Inicial**: Teorema de Bolzano: f(a) · f(b) < 0. Si tienen el mismo signo, arrojar error de dominio explicativo.
- **Fórmula de aproximación**:

  c_k = (a_k + b_k) / 2

- **Actualización de intervalo**:
  - Si f(a_k) · f(c_k) < 0 → b_{k+1} = c_k
  - Si f(a_k) · f(c_k) > 0 → a_{k+1} = c_k
  - Si f(c_k) = 0 → raíz exacta hallada.
- **Error Relativo Porcentual**:

  ε_a = |(c_k − c_{k−1}) / c_k| × 100%

### B. Método de Punto Fijo
- **Entradas**: Función g(x) (tal que x = g(x)), valor inicial x_0, tolerancia ε, máximo de iteraciones N_max.
- **Fórmula de aproximación**:

  x_{k+1} = g(x_k)

- **Detección de Divergencia**:
  - Evaluación de |x_{k+1}| > 10^12, valores `NaN` o `Infinity`.
  - Verificación opcional de criterio de convergencia: |g'(x)| < 1.
- **Error Relativo**:

  ε_a = |(x_{k+1} − x_k) / x_{k+1}| × 100%

### C. Método de Newton-Raphson
- **Entradas**: f(x), valor inicial x_0, tolerancia ε, máximo de iteraciones N_max, derivada f'(x) (calculada automáticamente con `mathjs.derivative` o provista por el usuario).
- **Fórmula de aproximación**:

  x_{k+1} = x_k − f(x_k) / f'(x_k)

- **Condición crítica**: f'(x_k) ≠ 0. Si |f'(x_k)| < 10^−12, arrojar error por pendiente nula / división por cero.
- **Error Relativo**:

  ε_a = |(x_{k+1} − x_k) / x_{k+1}| × 100%

---

## 6. Estado del Entorno Actual del Sistema

- **Sistema Operativo**: Linux (CachyOS / Arch Linux).
- **Shells**: Fish / Bash.
- **Node.js**: Instalado en `~/.local/node/bin` (versión `v24.21.0` LTS).
- **Gestor de Paquetes**: `pnpm` (`v12.8.1`).
- **Estado de Build**: Compilación Vite exitosa (`pnpm build`).
- **Suite de Pruebas**: 8 pruebas unitarias con Vitest pasando al 100% (`pnpm test`).
- **Control de Versiones**: Git no ha sido inicializado ni manipulado, en estricto cumplimiento de las directivas del usuario.
