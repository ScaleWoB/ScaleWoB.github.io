# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## User Requirements

Use leann MCP tools proactively.

## Project Overview

ScaleWoB is a GUI Agent Benchmark website for fair evaluation of GUI agents using AI-generated environments. This React/TypeScript application showcases benchmark environments, leaderboards, and provides interactive demonstrations with a sophisticated environment communication system.

## Core Commands

### Development

- `bun dev` - Start development server on port 3000
- `bun run build` - Production build (runs TypeScript compilation + Vite build)
- `bun run preview` - Preview production build locally

### Code Quality

- `bun run lint` - Run ESLint checks
- `bun run lint:fix` - Auto-fix ESLint issues
- `bun run format` - Format code with Prettier
- `bun run format:check` - Check code formatting
- `bun run precommit` - Run full pre-commit check (format + lint:fix + lint + build)

### Package Management

- `bun install` - Install dependencies
- `bun add <package>` - Add a dependency
- `bun add -d <package>` - Add a dev dependency
- `bun remove <package>` - Remove a dependency
- `bun update` - Update dependencies

### Git Hooks

- Uses **Husky** for pre-commit hooks that automatically run formatting and linting
- Pre-commit workflow: format → lint:fix → lint → build

## Architecture Overview

### Technology Stack

- **React 19.2.0** with TypeScript and functional components using hooks
- **HashRouter** for GitHub Pages compatibility (not BrowserRouter)
- **Vite** as build tool and development server
- **Tailwind CSS v4** for styling with custom warm color palette
- **ESLint 9.39.1** with TypeScript plugin for code quality
- **Prettier** for code formatting

### Key Directories

```
src/
├── pages/              # Route-level components (Homepage, LeaderboardHome, Environments, etc.)
├── components/
│   ├── common/         # Shared layout components (Layout, Navigation, Footer, Toast, Skeleton, etc.)
│   └── leaderboard/    # Leaderboard-specific components
├── hooks/              # Custom React hooks (useDebounce, etc.)
├── types/              # TypeScript type definitions
├── config/             # Configuration files (environment URLs)
├── services/           # Business logic and data services
├── scripts/            # Bridge script for CDN environments
├── styles/             # Global CSS and Tailwind extensions
└── utils/              # Utility functions
```

### Routing Architecture

The app uses **HashRouter** (essential for GitHub Pages) with these main routes:

- `/` - Homepage with hero section and features
- `/leaderboard` - Agent performance rankings
- `/environments` - Environment showcase with filtering
- `/launcher/:envId` - Dynamic environment launcher

### Key Features

#### ScaleWoB Bridge System

- **Sophisticated communication layer** (`src/scripts/scalewob-bridge.js`)
- Enables two-way communication between CDN-hosted environments and the main website
- Tracks user interactions (clicks, typing, scrolling, navigation)
- Executes commands from parent window (click, type, navigate, get-state)
- Uses postMessage API for secure cross-origin communication

#### Environment Integration

- **Environment data**: JSON in `env/environments.json` with TypeScript interfaces
- **URL configuration**: Centralized in `src/config/environmentUrls.ts` for CDN links
- **Type safety**: Comprehensive TypeScript types in `src/types/environment.ts`
- **Service layer**: Sophisticated caching and error handling in `src/services/environmentService.ts`

#### Parameter Evaluation System

- **Dynamic input handling**: Support for typed evaluation inputs (string, number, boolean)
- **Environment-specific parameters**: Defined in environment configuration
- **Runtime evaluation**: Interactive parameter submission for environment testing

## Development Patterns

### Component Architecture

- Functional components with TypeScript interfaces for props
- Custom hooks for complex state logic (useDebounce for search optimization)
- React.lazy and Suspense for code splitting and lazy loading
- Memoized components to prevent unnecessary re-renders
- Responsive design with mobile-first approach
- Consistent styling using Tailwind CSS utility classes
- Toast notifications for user feedback
- Skeleton screens for better perceived performance

### State Management

- React built-in state (useState, useEffect, useRef) - no external state library
- Custom hooks for optimized state updates (useDebounce)
- Environment data loaded asynchronously with skeleton loading states
- Error handling for failed environment loads with retry functionality
- URL-based state persistence for filters, search, and sorting

### Styling System

- **Custom warm color palette**: warm, coral, gold themes defined in `src/styles/globals.css`
- **Tailwind CSS v4** with custom configuration using PostCSS plugin
- **Custom utility classes**: btn-primary, card, gradient-warm, etc.
- **Responsive design**: Mobile-first approach with custom breakpoints
- **Performance optimizations**: CSS containment and will-change properties

### Data Management

- **Static environment data**: JSON format with task definitions, metrics, and CDN URLs
- **Environment parameters**: Support for typed evaluation inputs (string, number, boolean)
- **Performance metrics**: Completion rates and complexity scores
- **Platform categorization**: Web Applications, Desktop Apps, Mobile Interfaces
- **Service layer**: Caching, error handling, and retry logic in `environmentService.ts`

## Deployment Configuration

### GitHub Pages Setup

- **Repository name**: `ScaleWoB.github.io`
- **Base URL**: `/` (configured in vite.config.ts)
- **Automatic deployment**: GitHub Actions workflow on push to main branch
- **HashRouter requirement**: Essential for proper routing on GitHub Pages
- **Path-based triggers**: Only rebuilds when relevant files change

### Build Process

1. **TypeScript compilation** (`tsc`)
2. **Vite build** to `dist/` directory
3. **GitHub Actions** automatically deploys to GitHub Pages
4. **Production optimizations**: Minification, tree shaking, and bundle analysis

### CI/CD Pipeline

- **Automated testing**: ESLint checks run in CI before deployment
- **Conditional deployment**: Only deploys on main branch pushes
- **Manual triggers**: Workflow can be run manually via Actions tab
- **Artifact management**: Build artifacts uploaded and deployed as Pages

## Environment System

### Environment Structure

Each environment has:

- **Task name and description**: Clear definition of the evaluation task
- **Platform**: Web Applications, Desktop Apps, Mobile Interfaces
- **Difficulty level**: Basic, Advanced, Expert
- **Performance metrics**: Completion rates and complexity scores
- **Color theme**: Visual consistency (warm, coral, gold)
- **Parameters**: Typed evaluation inputs for dynamic configuration
- **CDN URL**: External hosting location for live environments

### CDN Integration

- **External hosting**: Environments hosted on CDN for isolation and performance
- **Bridge script injection**: Communication layer embedded in hosted environments
- **URL management**: Centralized configuration in `environmentUrls.ts`
- **Fallback handling**: Graceful degradation for missing environments
- **Cross-origin security**: Secure postMessage communication

### Environment Service Architecture

- **Singleton pattern**: `EnvironmentDataService` for centralized data management
- **Intelligent caching**: 5-minute default cache timeout with configurable options
- **Retry logic**: Automatic retry with exponential backoff for failed requests
- **Type safety**: Comprehensive TypeScript interfaces for all data structures
- **Error boundaries**: Graceful error handling with user-friendly messages

## Development Considerations

### Critical Requirements

- **HashRouter**: Must use instead of BrowserRouter for GitHub Pages compatibility
- **Cross-origin communication**: Bridge system requires careful message handling
- **Type safety**: Strict TypeScript mode enabled - all data must be properly typed
- **Performance**: CDN loading and bridge communication should not block UI
- **Mobile responsiveness**: All components must work on mobile devices

### Testing Strategy

- **No test framework**: Currently no automated tests - relies on manual testing
- **Build verification**: Pre-commit hooks ensure code quality and successful builds
- **Environment testing**: Manual verification of CDN environment loading and communication
- **Cross-browser testing**: Verify bridge communication across different browsers

### Performance Optimization

- **Code splitting**: Route-based code splitting with React.lazy reduces initial bundle by ~30%
- **Lazy loading**: All route components loaded on-demand (Homepage, LeaderboardHome, Environments, EnvironmentWrapper)
- **Memoization**: Platform icons and expensive computations memoized to prevent re-renders
- **Debounced search**: Custom useDebounce hook optimizes search filtering (300ms delay)
- **Skeleton screens**: Show content structure immediately while data loads
- **Bundle analysis**: Monitor bundle size and optimize dependencies
- **CDN caching**: Leverage browser caching for static environment assets

### Accessibility Features

- **Keyboard navigation**: Full keyboard support with visible focus indicators
- **Keyboard shortcuts**: Press `/` to focus search, `Esc` to clear
- **ARIA labels**: Comprehensive labels for screen readers on all interactive elements
- **Focus indicators**: 2px solid gray-800 outline on all focusable elements
- **Toast notifications**: Accessible notifications with aria-live regions
