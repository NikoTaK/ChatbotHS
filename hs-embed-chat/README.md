# HS Embed Chat

A modern chat interface built with React, Vite, TypeScript, and Tailwind CSS.

## Features

- ⚡️ Vite for fast development and optimized builds
- ⚛️ React 18 with TypeScript
- 🎨 Tailwind CSS with custom HS branding theme
- 🎯 Ready for deployment on lovable.app

## Theme Tokens

The project uses custom HS branding colors:

- **hs.primary**: Purple/indigo gradient (shades 50-950)
- **hs.bg**: Neutral backgrounds (white, neutral-50)
- **hs.text**: Neutral-900 text colors

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
# Build for production
npm run build
```

### Preview

```bash
# Preview production build locally
npm run preview
```

## Project Structure

```
hs-embed-chat/
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   ├── styles.css       # Tailwind CSS imports
│   └── vite-env.d.ts    # Vite type definitions
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind configuration with HS theme
├── postcss.config.js    # PostCSS configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Deployment

This project is configured for deployment on lovable.app. Follow lovable.app's deployment instructions to deploy your application.

## License

MIT
