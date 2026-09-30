# Métodos Numéricos — Solucionador Interactivo

Aplicación web interactiva para resolver ecuaciones no lineales mediante métodos numéricos iterativos, con visualización paso a paso y graficación 2D en tiempo real.

## Características

- **Tres métodos iterativos**: Bisección, Punto Fijo y Newton-Raphson
- **Visualización tabular**: Cada iteración muestra valores, errores relativos y criterios de convergencia
- **Graficación interactiva**: Representación 2D de la función, raíces, tangentes y delimitadores de intervalo
- **Validación estricta**: Verificación de condiciones de convergencia (Teorema de Bolzano, criterio de pendiente, detección de divergencia)
- **Alta precisión**: Evaluación simbólica y numérica con `mathjs`
- **Arquitectura limpia**: Separación en capas de dominio, aplicación, infraestructura y presentación

## Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| Framework | React + Vite + TypeScript |
| Evaluación matemática | mathjs |
| Graficación | function-plot (D3) |
| Estilos | Tailwind CSS + shadcn/ui |
| Pruebas | Vitest |

## Métodos Implementados

| Método | Entradas | Criterio de paro |
| :--- | :--- | :--- |
| **Bisección** | f(x), intervalo [a, b] | Error relativo porcentual o \|f(x)\| < ε |
| **Punto Fijo** | g(x), valor inicial x₀ | Error relativo porcentual |
| **Newton-Raphson** | f(x), valor inicial x₀ | Error relativo porcentual |

## Estructura del Proyecto

```
src/
├── core/
│   ├── domain/          # Entidades, errores y puertos
│   └── application/     # Casos de uso y DTOs
├── infrastructure/      # Adaptadores (mathjs, exportación)
└── presentation/        # Componentes React, hooks y vistas
```

## Scripts Disponibles

```bash
pnpm dev       # Servidor de desarrollo
pnpm build     # Compilación de producción
pnpm test      # Suite de pruebas unitarias
```

## Arquitectura

El proyecto sigue los principios de **Clean Architecture**, garantizando que las capas internas (dominio) no dependan de las externas (infraestructura, presentación). Los casos de uso orquestan la lógica de negocio a través de puertos definidos en el dominio, implementados por adaptadores en la infraestructura.
