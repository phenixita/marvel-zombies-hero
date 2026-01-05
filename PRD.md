# Planning Guide

A digital companion app for managing hero turn tracking in Marvel Zombies board game sessions, providing persistent state management with keyboard-first interaction for seamless tabletop gameplay.

**Experience Qualities**: 
1. **Efficient** - Keyboard shortcuts and rapid interactions minimize disruption to physical gameplay flow
2. **Polished** - Refined visual design with subtle animations that communicate state changes clearly
3. **Reliable** - Full offline functionality with automatic state persistence ensures no game progress is lost

**Complexity Level**: Light Application (multiple features with basic state)
This app manages persistent game state across multiple hero cards with editable properties, health/hunger tracking, and power management - more than a micro tool but not requiring complex routing or advanced state orchestration.

## Essential Features

### Game Initialization
- **Functionality**: Creates new game session with specified number of hero cards
- **Purpose**: Sets up clean game state and prevents accidental data loss from previous sessions
- **Trigger**: User opens app or clicks "New Game" button
- **Progression**: App loads → Detects existing state → Shows confirmation dialog (if state exists) → User confirms/cancels → Prompts for hero count (1-6 heroes) → Creates hero cards → Shows game board
- **Success criteria**: Previous game state is preserved until confirmed reset, new heroes initialize with default values (5 health, 0 hunger, empty powers)

### Hero Card Display
- **Functionality**: Shows all hero cards in responsive grid layout with visual state indicators
- **Purpose**: Provides at-a-glance view of all heroes' current status during gameplay
- **Trigger**: After game initialization completes
- **Progression**: Cards render → Display health (5 circles top), hunger (0-4 scale left), hero name, 4 power slots → Updates reflect immediately
- **Success criteria**: All cards visible simultaneously on desktop, scrollable on mobile, state changes update instantly

### Health Management
- **Functionality**: Track and modify hero health points (0-5)
- **Purpose**: Monitor hero survival and trigger elimination when health reaches zero
- **Trigger**: Click health circles or use keyboard shortcuts
- **Progression**: User clicks/presses key → Health decrements/increments → Visual indicator updates → State persists
- **Success criteria**: Health never exceeds 5 or goes below 0, changes save immediately, visual feedback is instant

### Hunger Management
- **Functionality**: Track and modify hunger levels (0-4)
- **Purpose**: Manage core game mechanic of zombie hunger progression
- **Trigger**: Click hunger indicators or use keyboard shortcuts
- **Progression**: User interacts → Hunger level changes → Scale updates visually → State persists
- **Success criteria**: Hunger constrained to 0-4 range, clear visual distinction between levels

### Hero Name Editing
- **Functionality**: Rename heroes with custom names
- **Purpose**: Personalize heroes to match actual character names from game cards
- **Trigger**: Click hero name or use keyboard shortcut
- **Progression**: User clicks name → Text becomes editable input → User types → Blur/Enter saves → Name updates
- **Success criteria**: Names persist across sessions, inline editing feels natural, empty names show placeholder

### Power Management
- **Functionality**: Add/edit/remove power cards with title and description
- **Purpose**: Track unique hero abilities and their effects
- **Trigger**: Click power slot or use keyboard shortcut
- **Progression**: User clicks slot → Dialog opens → User enters title & description → Saves → Power displays on card
- **Success criteria**: 4 power slots per hero, free-form text, editable/deletable, persists across sessions

### Keyboard Navigation
- **Functionality**: Full keyboard control for all interactions
- **Purpose**: Enable rapid gameplay tracking without mouse dependency
- **Trigger**: User presses keyboard shortcuts
- **Progression**: User sees keyboard hint overlay (?) → Presses shortcut → Action executes → Focus indicators guide navigation
- **Success criteria**: Tab navigation works logically, shortcuts follow common conventions (Ctrl/Cmd+N for new, Ctrl/Cmd+E for edit, +/- for increment/decrement), visual focus indicators always visible

## Edge Case Handling

- **Zero heroes selected** - Minimum 1 hero enforced during initialization
- **Excessive heroes** - Maximum 6 heroes to maintain usable card sizes
- **Empty power slots** - Display placeholder prompts to add powers
- **Rapid clicking** - Debounce health/hunger changes to prevent accidental double-triggers
- **Name conflicts** - Allow duplicate names (players may use same hero twice)
- **Browser storage limits** - Unlikely with small data size, but show error if storage fails
- **Keyboard shortcuts while editing** - Disable shortcuts when text inputs are focused
- **Page refresh during edit** - Auto-save on all changes prevents data loss

## Design Direction

The design should evoke the gritty, apocalyptic atmosphere of Marvel Zombies while maintaining high readability for gameplay. Think: dark comic book aesthetic meets modern UI polish - dramatic but functional, zombie-themed but not cluttered. The interface should feel like a high-tech S.H.I.E.L.D. monitoring system tracking corrupted heroes.

## Color Selection

A dark, cinematic palette with vibrant danger accents reflecting the zombie apocalypse theme.

- **Primary Color**: Deep crimson red (oklch(0.45 0.20 25)) - Represents zombie corruption and danger, used for primary actions and hunger indicators
- **Secondary Colors**: Dark slate background (oklch(0.15 0.01 265)) for cards and panels; Bone white (oklch(0.95 0.01 95)) for text providing stark contrast
- **Accent Color**: Toxic green (oklch(0.70 0.20 145)) - Highlights active states, health indicators when full, and success actions
- **Foreground/Background Pairings**: 
  - Background (Dark Slate #0F1419): Bone White text (oklch(0.95 0.01 95)) - Ratio 14.2:1 ✓
  - Primary (Crimson Red oklch(0.45 0.20 25)): White text (oklch(0.98 0 0)) - Ratio 5.2:1 ✓
  - Accent (Toxic Green oklch(0.70 0.20 145)): Dark text (oklch(0.15 0.01 265)) - Ratio 7.8:1 ✓

## Font Selection

Typography should blend comic book impact with digital precision, conveying urgency without sacrificing legibility for extended gameplay sessions.

- **Primary Font**: Rajdhani (Bold/SemiBold) - Angular, militaristic letterforms perfect for hero names and headings
- **Secondary Font**: Inter (Regular/Medium) - Clean, readable for power descriptions and UI text

- **Typographic Hierarchy**: 
  - H1 (Hero Name): Rajdhani Bold / 24px / -0.02em letter-spacing / uppercase
  - H2 (Power Title): Rajdhani SemiBold / 14px / -0.01em / uppercase
  - Body (Power Description): Inter Regular / 12px / 0.4em line-height
  - UI Labels: Inter Medium / 11px / uppercase / 0.05em letter-spacing

## Animations

Animations should provide clear feedback for state changes while maintaining gameplay flow - think precise tactical readouts rather than playful bounces. Use subtle scale transforms (0.95-1.0) on button presses, smooth 200ms transitions for health/hunger indicators filling/emptying, and quick 150ms opacity fades for dialogs appearing. Avoid delays that interrupt keyboard-driven interaction.

## Component Selection

- **Components**: 
  - Dialog (game initialization prompts and power editing)
  - Card (hero cards with custom dark styling)
  - Input (inline hero name editing)
  - Button (primary actions with primary/ghost variants)
  - Badge (power titles with custom dark styling)
  - Alert Dialog (confirm game reset)
  - Tooltip (keyboard shortcut hints)
  
- **Customizations**: 
  - Custom HealthIndicator component (5 circles, clickable, filled/empty states)
  - Custom HungerScale component (vertical 0-4 scale on left side of card)
  - Custom PowerSlot component (editable card sections with title/description)
  - Custom KeyboardHint overlay (toggle with ?, shows all shortcuts)

- **States**: 
  - Buttons: scale down 5% on press, glow ring on focus, dim 60% when disabled
  - Health circles: filled (toxic green), damaged (dark slate), hover scale 110%
  - Hunger scale: gradient fill from bottom up (crimson intensifying), active level pulses
  - Cards: subtle shadow lift on hover, border glow on keyboard focus
  - Inputs: underline style, glow on focus, smooth cursor blink

- **Icon Selection**: 
  - Plus (add power/hero)
  - Minus (reduce health/hunger)
  - Pencil (edit name/power)
  - Skull (hunger indicator)
  - Heart (health indicator)
  - Keyboard (show shortcuts)
  - RefreshCw (reset game)
  - Zap (power indicator)

- **Spacing**: 
  - Card padding: p-6
  - Card gaps: gap-6 (grid)
  - Element spacing within cards: gap-4
  - Tight element groups: gap-2
  - Section margins: mb-8

- **Mobile**: 
  - Cards stack vertically on <768px
  - Hero name font scales down to 20px
  - Health circles reduce to 32px diameter
  - Power slots become accordion-style collapsible sections
  - Keyboard shortcuts hidden on mobile, touch-optimized tap targets (min 44px)
  - Floating action button for "New Game" on mobile bottom-right
