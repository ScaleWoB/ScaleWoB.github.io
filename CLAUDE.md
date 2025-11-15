# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ScaleWoB is a GUI Agent Benchmark website for fair evaluation of GUI agents using AI-generated environments. This React/TypeScript application showcases benchmark environments, leaderboards, and provides interactive demonstrations.

## Core Commands

### Development

- `npm run dev` - Start development server on port 3000
- `npm run build` - Production build (runs TypeScript compilation + Vite build)
- `npm run preview` - Preview production build locally

### Code Quality

- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run precommit` - Run full pre-commit check (format + lint:fix + lint + build)

## Architecture Overview

### Application Structure

- **React 19.2.0** with TypeScript and functional components using hooks
- **HashRouter** for GitHub Pages compatibility (not BrowserRouter)
- **Vite** as build tool and development server
- **Tailwind CSS v4** for styling with custom warm color palette

### Key Directories

```
src/
├── pages/              # Route-level components (Homepage, LeaderboardHome, Gallery, etc.)
├── components/
│   └── common/         # Shared layout components (Layout, Navigation, Footer, etc.)
├── types/              # TypeScript type definitions
├── config/             # Configuration files (environment URLs)
├── services/           # Business logic and data services
├── scripts/            # Bridge script for CDN environments
├── data/               # Static data (environments.json)
└── styles/             # Global CSS and Tailwind extensions
```

### Routing Architecture

The app uses HashRouter with these main routes:

- `/` - Homepage with hero section and features
- `/leaderboard` - Agent performance rankings
- `/gallery` - Environment showcase with filtering
- `/launcher/:envId` - Dynamic environment launcher (shows launcher for CDN environments, placeholder for others)

### Environment Integration

The core feature is the **ScaleWoB Bridge** (`src/scripts/scalewob-bridge.js`) - a sophisticated communication layer that:

- Enables two-way communication between CDN-hosted environments and the main website
- Tracks user interactions (clicks, typing, scrolling, navigation)
- Executes commands from parent window (click, type, navigate, get-state)
- Uses postMessage API for secure cross-origin communication
- Provides comprehensive event tracking with debounced scroll detection

### Data Management

- **Environment data**: Static JSON in `src/data/environments.json` with TypeScript interfaces
- **URL configuration**: Centralized in `src/config/environmentUrls.ts` for CDN links
- **Type safety**: Comprehensive TypeScript types for all environment-related data in `src/types/environment.ts`

## Development Patterns

### Component Architecture

- Functional components with TypeScript interfaces for props
- Custom hooks for complex state logic
- Responsive design with mobile-first approach
- Consistent styling using Tailwind CSS utility classes

### State Management

- React built-in state (useState, useEffect) - no external state library
- Environment data loaded asynchronously with proper loading states
- Error handling for failed environment loads

### Styling System

- Custom warm color palette (warm, coral, gold themes)
- Tailwind CSS v4 with custom configuration
- Responsive breakpoints and mobile-first design
- Consistent spacing and typography scales

## Deployment Configuration

### GitHub Pages Setup

- Repository name: `ScaleWoB.github.io`
- Base URL: `/` (configured in vite.config.ts)
- Automatic deployment via GitHub Actions workflow
- HashRouter essential for proper routing on GitHub Pages

### Build Process

1. TypeScript compilation (`tsc`)
2. Vite build to `dist/` directory
3. GitHub Actions automatically deploys to GitHub Pages on push to main branch

## Environment System

### Environment Structure

Each environment has:

- Task name and description
- Platform (Web Applications, Desktop Apps, Mobile Interfaces)
- Difficulty level (Intermediate, Advanced, Expert)
- Performance metrics (completion, complexity)
- Color theme for visual consistency

### CDN Integration

- Environments hosted externally on CDN
- Bridge script injected for communication
- URL management through configuration system
- Fallback handling for missing environments
