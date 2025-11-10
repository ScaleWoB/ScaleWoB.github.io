# ScaleCUA Benchmark Website

This is the official website for the **ScaleCUA** GUI Agent Benchmark - a revolutionary platform for fair evaluation of GUI agents using AI-generated environments.

## Project Overview

ScaleCUA is a comprehensive GUI agent benchmark that solves critical problems in AI evaluation by creating unique testing scenarios for each evaluation, preventing over-fitting and ensuring fair assessment of agent capabilities.

### Key Features

- **AI-Generated Environments**: Dynamic testing environments unique to each evaluation
- **Fair Evaluation Methodology**: Eliminates memorization issues found in fixed benchmarks
- **Multi-platform Support**: Web applications, desktop apps, and mobile interfaces
- **Real-time Interaction Testing**: Clicking, typing, navigation, and multi-step operations

## Technology Stack

- **React 18.2.0** - Modern UI framework with TypeScript support
- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe development
- **React Router DOM 6.15.0** - Client-side routing with HashRouter for GitHub Pages compatibility
- **Tailwind CSS 3.3.3** - Utility-first CSS framework with custom design system
- **ESLint** - Code quality and linting

## Development Guidelines

### Project Structure

```
src/
├── pages/           # Main page components
├── components/      # Reusable UI components
│   └── common/      # Shared layout components
├── styles/          # Global CSS and Tailwind extensions
└── main.tsx         # Application entry point
```

### Available Scripts

- `npm run dev` - Development server on port 3000
- `npm run build` - Production build
- `npm run preview` - Preview production build locally
- `npm run deploy` - Deploy to GitHub Pages
- `npm run lint` - Run ESLint code quality checks

### Design System

The website uses a custom warm color palette:

- **Warm colors**: Primary branding colors
- **Coral accents**: Highlight and interactive elements
- **Gold details**: Premium feature indicators

### Key Development Notes

- Uses **HashRouter** for GitHub Pages compatibility
- Responsive design with mobile-first approach
- Component-based architecture following React best practices
- TypeScript for type safety and better developer experience

## Deployment

- Configured for GitHub Pages deployment
- Base URL: `https://ScaleCUA.github.io`
- Build output in `dist/` directory
- Uses `gh-pages` branch for deployment

## Code Quality

- ESLint configuration for React + TypeScript
- Prettier formatting (if configured)
- Clean component structure with proper TypeScript types
- Modern React patterns with hooks and functional components

## Content Sections

- **Homepage**: Hero section, features, and benchmark statistics
- **Leaderboard**: Agent performance rankings (placeholder for upcoming data)
- **Environment**: Interactive environment showcase and demonstrations

## Development Best Practices

1. Follow existing component structure and naming conventions
2. Use TypeScript types for all props and state
3. Maintain responsive design principles
4. Use Tailwind CSS classes for styling
5. Test locally before deployment
6. Keep build size optimized for GitHub Pages

## GitHub Pages Configuration

- Repository name must match the deployment URL
- HashRouter ensures proper routing on GitHub Pages
- Base URL configured in Vite for asset loading
- Automatic deployment via npm scripts
