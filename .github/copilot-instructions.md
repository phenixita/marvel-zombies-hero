# Marvel Zombies Hero Tracker - Development Guide

## Project Overview

A React-based digital companion for Marvel Zombies board game that tracks hero health, hunger, powers, and turn state with persistent local storage. Built with Vite + React 19 + TypeScript + Tailwind CSS v4.

Useful detail are found in the [PRD.md](../PRD.md).

**Core Architecture**: Single-page app with centralized state in [src/App.tsx](src/App.tsx), persistent localStorage via [usePersistentState hook](src/hooks/usePersistentState.ts), and component-driven UI using Radix UI primitives.

## Critical Development Patterns

### State Management
- **Always use `usePersistentState` for game state** - Auto-saves to localStorage on every change
- State shape: `GameState { heroes: Hero[] }` where each `Hero` has `id`, `name`, `health` (0-5), `hunger` (0-4), `powers[]`
- Update pattern: Use functional setState to map over heroes array - see [HeroCard.tsx](src/components/HeroCard.tsx) for examples
- Never mutate hero objects directly; always spread and replace

### Component Structure
- **Compound components pattern**: `HeroCard` composes `HealthIndicator`, `HungerScale`, `PowerSlot` sub-components
- **Radix UI as foundation**: All dialogs, buttons, inputs use [src/components/ui](src/components/ui) wrappers
- Custom game components live in [src/components](src/components) (not in ui/ subfolder)
- Icons: Use `lucide-react` for all icons

### Styling & Theming
- **Tailwind v4 with CSS variables**: All colors reference Radix color scales via `--color-*` vars in [theme.css](src/styles/theme.css)
- Key color mappings: `accent` = blue, `neutral` = slate, custom danger/success use Radix `crimson`/`green`
- **Typography**: `font-rajdhani` for hero names/headings (uppercase, bold), `font-inter` for body text
- **Spacing**: Use Tailwind spacing classes (`gap-4`, `p-6`) - they scale via `--size-scale` CSS var
- Dark theme: Auto-switches via `.dark-theme` class on `#spark-app`

### Key Workflows

**Development**: 
```bash
npm run dev  # Starts Vite dev server on port 5173
```

**Building**:
```bash
npm run build  # TypeScript compile + Vite build to dist/
```

**No test suite configured** - manual testing in browser required

### Integration Points
- **GitHub Spark framework**: Uses `@github/spark` for Vite plugin (DO NOT REMOVE from vite.config.ts)
- **Path alias**: `@/` maps to `src/` - always use for imports

## Project-Specific Conventions

1. **Hero ID generation**: Use `crypto.randomUUID()` for new hero IDs
2. **Keyboard shortcuts**: Handled in App.tsx with global listeners - Cmd/Ctrl+N (new game), Cmd/Ctrl+K (shortcuts help)
3. **Power slots**: Fixed 4 slots per hero, index-based (not by power.id)
4. **Health/hunger bounds**: Enforce 0-5 health, 0-4 hunger using `Math.max(0, Math.min(max, value))`
5. **Toast notifications**: Use `sonner` library - `toast.success()`, `toast.error()` only (no info/warning needed)
6. **Empty state**: When `heroes.length === 0`, show centered splash screen with GameInitDialog
7. **Inline editing pattern**: Name editing uses controlled input with blur/Enter to save, Escape to cancel

## Common Gotchas

- **Vite config plugins** - `sparkPlugin()` requires `as PluginOption` cast
- **CSS imports order** - theme.css must import Radix colors before Tailwind layers
- **TypeScript path resolution** - `@/` alias only works with `resolve()` from 'path' in vite.config.ts
- **localStorage key** - Game state uses fixed key `'marvel-zombies-game'` - don't change

## File Organization

```
src/
├── App.tsx                    # Main app, global keyboard handlers, game init
├── components/
│   ├── HeroCard.tsx          # Individual hero card with inline name editing
│   ├── HeroGrid.tsx          # Grid layout for all heroes
│   ├── HealthIndicator.tsx   # 5 clickable health circles
│   ├── HungerScale.tsx       # Vertical 0-4 hunger scale
│   ├── PowerSlot.tsx         # Single power card slot
│   ├── PowerEditDialog.tsx   # Modal for editing power title/description
│   ├── GameInitDialog.tsx    # New game prompt with hero count input
│   └── ui/                   # Radix UI wrapper components (DON'T EDIT)
├── hooks/
│   └── usePersistentState.ts # localStorage sync hook
└── lib/
    ├── types.ts              # TypeScript interfaces (Hero, Power, GameState)
    └── utils.ts              # cn() utility for className merging
```

## Design Philosophy

**Keyboard-first interaction** - All actions accessible via shortcuts, minimal mouse dependency.  
**Instant persistence** - No save buttons, state syncs automatically to localStorage.  
**Comic book aesthetic** - Dark theme, Rajdhani font, Radix colors for gritty zombie feel.

When adding features, prioritize keyboard navigation, maintain immutable state updates, and use existing Radix UI components before creating custom ones.
