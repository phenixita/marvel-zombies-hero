# Marvel Zombies Hero Tracker

A React-based digital companion app for the Marvel Zombies board game that tracks hero health, hunger, powers, and game state with persistent local storage.

## Features

- **Hero Management**: Create and manage multiple heroes for your game sessions
- **Health Tracking**: Monitor hero health (0-5 scale) with intuitive click indicators
- **Hunger Management**: Track hunger levels (0-4 scale) for each hero
- **Power Slots**: Assign and manage up to 4 powers per hero with descriptions
- **Persistent Storage**: All game state auto-saves to browser localStorage—no manual saves needed
- **Keyboard-First**: Complete interaction via keyboard shortcuts (Cmd/Ctrl+N for new game, Cmd/Ctrl+K for help)
- **Dark Theme**: Comic book-inspired dark interface with Rajdhani typography

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **UI Library**: Radix UI components
- **Styling**: Tailwind CSS v4 with CSS variables
- **State Management**: React hooks with localStorage persistence
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 20.0.0 or higher
- npm

### Development

```bash
# Install dependencies
npm install

# Start development server (runs on port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm lint
```

## Architecture

The app follows a component-driven architecture:

- **Single-page app** with centralized state in `src/App.tsx`
- **Persistent state** via the `usePersistentState` hook that syncs with localStorage
- **Compound components**: `HeroCard` composes sub-components like `HealthIndicator`, `HungerScale`, and `PowerSlot`
- **Radix UI** primitives for all interactive elements

## Project Structure

```
src/
├── App.tsx                    # Main app component with global keyboard handlers
├── components/
│   ├── HeroCard.tsx          # Individual hero card with inline editing
│   ├── HeroGrid.tsx          # Grid layout for heroes
│   ├── HealthIndicator.tsx   # Health tracking UI
│   ├── HungerScale.tsx       # Hunger level UI
│   ├── PowerSlot.tsx         # Power card slots
│   ├── PowerEditDialog.tsx   # Power editing modal
│   ├── GameInitDialog.tsx    # New game dialog
│   └── ui/                   # Radix UI wrapper components
├── hooks/
│   └── usePersistentState.ts # localStorage sync hook
└── lib/
    ├── types.ts              # TypeScript type definitions
    └── utils.ts              # Utility functions
```

## Development Guidelines

- Use `usePersistentState` for all game state management
- Maintain immutable state updates (spread operator pattern)
- Follow keyboard-first interaction patterns
- Use existing Radix UI components before creating custom ones
- All colors reference Radix color scales via CSS variables

## License

See LICENSE file for details.

## Give It a Try!

[Launch the app](https://mzc.micheleferracin.it)
