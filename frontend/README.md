# DocentAI Frontend

A production-ready Next.js (App Router) + TypeScript + Tailwind CSS frontend for DocentAI.

This document provides an in-depth overview of the architecture, project structure, development workflows, available scripts, configuration, and deployment. It is intended to help contributors and operators quickly understand and work with the codebase.


## Table of Contents
- Overview
- Architecture
- Tech Stack
- Project Structure
- Pages and Routes
- Components Overview
- Styling
- Development Setup
- NPM Scripts
- Environment Variables
- API Routes
- Code Quality and Conventions
- Building and Deployment
- Troubleshooting
- FAQ
- License


## Overview
DocentAI Frontend is a modern web application built on Next.js using the App Router paradigm. It focuses on a workspace-driven UI with a preview window, file tree, and prompt-driven interactions.

Key capabilities:
- Workspace page that organizes a file tree, prompt inputs, and a preview window.
- Upload API route to handle file uploads (for development/local workflows).
- Reusable UI primitives and layout components to maintain consistency across pages.


## Architecture
- Next.js App Router (src/app) for routing, server components, and API routes.
- Colocation of components by domain: dashboard/, layout/, ui/.
- TypeScript for type safety across the app and components.
- Tailwind CSS for utility-first styling with global CSS configuration.
- ESLint for static analysis.


## Tech Stack
- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS, PostCSS
- Linting: ESLint
- Package Manager: npm (works with pnpm/yarn if preferred)

Minimum recommended Node.js version: 18.18+ (Node 20 LTS recommended)


## Project Structure
The repository uses a conventional Next.js + TypeScript layout with App Router:

- public/
  - Static assets served at the site root.
  - Includes SVGs and images such as project.webp.

- src/
  - app/
    - api/
      - upload/route.ts — Upload API route (multipart/form-data handling).
    - workspace/page.tsx — Workspace page showcasing the dashboard layout.
    - favicon.ico — Site icon.
    - globals.css — Global styles; Tailwind base layers and custom CSS.
    - layout.tsx — Root layout for App Router (document shell).
    - page.tsx — Home page (landing/overview).
  - components/
    - dashboard/
      - DecentAIBanner.tsx — Banner component for dashboard pages.
      - FileTree.tsx — Domain-specific file tree for the dashboard.
      - Hero.tsx — Hero section component for landing/marketing context.
      - Horizon.tsx — Section/divider component used in dashboard context.
      - PreviewWindow.tsx — Live preview/viewport component for workspace.
      - PromptBar.tsx — Prompt input/action bar.
      - Sidebar.tsx — Sidebar container and navigation for the workspace.
    - layout/
      - BigFooter.tsx — Extended footer for marketing pages.
      - Footer.tsx — Site footer.
      - Navbar.tsx — Top navigation bar.
    - ui/
      - Button.tsx — Button primitive with variants.
      - FileTree.tsx — Reusable UI-level file tree (generic variant).
      - SocialIcons.tsx — Social icon set.
  - lib/
    - constants.ts — Constants shared across the app.
    - utils.ts — Utility helpers (formatters, guards, etc.).

- Configuration
  - eslint.config.mjs — ESLint configuration.
  - next.config.ts — Next.js configuration.
  - postcss.config.mjs — PostCSS and Tailwind pipeline configuration.
  - tsconfig.json — TypeScript configuration.
  - package.json — Scripts and dependencies.


## Pages and Routes
- / (src/app/page.tsx)
  - Likely the marketing or overview landing page using layout and hero components.

- /workspace (src/app/workspace/page.tsx)
  - Workspace view combining Sidebar, FileTree, PromptBar, and PreviewWindow to create an interactive environment.

- /api/upload (src/app/api/upload/route.ts)
  - API route for handling file uploads (multipart/form-data). See the source for exact behavior and constraints.


## Components Overview
Key component groups and their typical responsibilities:

- Dashboard components (src/components/dashboard/)
  - Sidebar: container and navigation for the workspace UI.
  - FileTree (dashboard): domain-specific file listing for the workspace.
  - PromptBar: prompt input and action triggers.
  - PreviewWindow: renders preview of selected/edited content.
  - DecentAIBanner, Hero, Horizon: supporting/marketing visuals.

- Layout components (src/components/layout/)
  - Navbar/BigFooter/Footer: shared site chrome and global sections.

- UI primitives (src/components/ui/)
  - Button: standardized interactive element with styling variants.
  - FileTree (ui): generic, reusable tree suited for multiple contexts.
  - SocialIcons: centralized social iconography.

- Lib (src/lib/)
  - constants.ts: application constants (labels, URLs, config flags, etc.).
  - utils.ts: shared utilities (e.g., className helpers, formatting, guards).


## Styling
- Tailwind CSS is used for utility-first styling.
- Global styles live in src/app/globals.css.
- The PostCSS pipeline (postcss.config.mjs) orchestrates Tailwind and autoprefixing.
- Component-level styling should favor Tailwind utility classes and composition.


## Development Setup
Prerequisites:
- Node.js 18.18+ (Node 20 LTS recommended)
- npm 9+ (or pnpm/yarn)

Install dependencies:
```
npm install
```

Start the development server:
```
npm run dev
```
The app will start in development mode. By default, Next.js serves on http://localhost:3000.

Type checking (on-demand):
```
npm run build --workspaces=false
```
Note: Next.js will perform type checks during build by default. For continuous type checking locally, many editors provide TS diagnostics on save.


## NPM Scripts
Common scripts typically available in this project:
- dev: Start the development server with hot reloading.
- build: Build the application for production.
- start: Start the production server locally using the build output.
- lint: Run ESLint over the codebase.

Usage examples:
```
# Development
npm run dev

# Lint only
npm run lint

# Production build and run
npm run build
npm run start
```

Check package.json for the authoritative list of scripts and any project-specific flags.


## Environment Variables
Create a .env.local file in the project root for local development. Variables defined there are loaded by Next.js.

Guidelines:
- Prefix variables with NEXT_PUBLIC_ if they are needed on the client.
- Do not commit .env.local files to version control.

Example (adjust to your needs):
```
# Public (exposed to browser)
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Server-only (not exposed to browser)
FILE_UPLOAD_MAX_BYTES=10485760
```

Refer to the source of src/app/api/upload/route.ts and any utilities for the exact environment variables used.


## API Routes
- POST /api/upload
  - Purpose: accept multipart/form-data uploads for local development or testing.
  - Request: multipart/form-data (e.g., via FormData in the browser). Consult the route implementation to confirm field names and limits.
  - Response: JSON. See the source file for the exact response schema.

Client example (generic):
```ts
const form = new FormData();
form.append('file', file);

const res = await fetch('/api/upload', {
  method: 'POST',
  body: form,
});

if (!res.ok) throw new Error('Upload failed');
const data = await res.json();
```


## Code Quality and Conventions
- TypeScript-first: favor explicit types and inference where appropriate.
- Linting: run npm run lint before commits; address warnings and errors.
- File structure: co-locate domain components and prefer smaller, composable units.
- Accessibility: use semantic HTML and ensure interactive elements are keyboard accessible.
- Imports: use absolute imports if configured; otherwise maintain consistent relative paths.


## Building and Deployment
Production build:
```
npm run build
```

Start locally (after build):
```
npm run start
```

Deployment targets:
- Vercel: zero-config for Next.js; connect the repo and deploy.
- Node server: build and start as above on your infrastructure.

Static assets are served from public/ at the site root.


## Troubleshooting
- Port already in use: change the dev server port, e.g. `PORT=3001 npm run dev`.
- Type errors on build: check tsconfig.json and update types; ensure all dependencies are installed.
- Tailwind class not applying: verify globals.css includes Tailwind directives and content paths are correct in the Tailwind setup.
- API route not reachable: confirm the path (/api/upload) and method (POST); review server logs in the terminal.


## FAQ
- Can I use pnpm or yarn? Yes. Replace npm commands with your preferred package manager equivalents.
- How do I add new routes? Create a new directory under src/app/<route>/page.tsx.
- Where do I put server-only code? In server components, API routes under src/app/api, or in server utilities not imported by client components.


## License
Proprietary. All rights reserved unless explicitly stated otherwise.