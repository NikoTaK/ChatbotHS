# HS Embed Chat

A modern, accessible chat widget built with React, Vite, TypeScript, and Tailwind CSS.

## Features

- ⚡️ Vite for fast development and optimized builds
- ⚛️ React 18 with TypeScript
- 🎨 Tailwind CSS with custom HS branding theme
- ♿️ WCAG 2.1 AA compliant with full keyboard navigation
- 📱 Responsive design with mobile support
- 🎯 Embeddable on any website
- 🎭 Multiple message types (text, gallery, embed, catalogue)

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

## Accessibility

This widget is built with accessibility as a core feature:

### Keyboard Navigation

- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons and links
- **Escape**: Close chat panel and gallery modal
- **Arrow Keys**: Navigate gallery images (← →)
- **Shift+Enter**: New line in message input
- **Enter**: Send message

### Screen Reader Support

- All interactive elements have descriptive `aria-label` attributes
- Proper semantic HTML structure
- Focus management in modals
- Live region announcements for dynamic content

### Visual Accessibility

- **Focus Rings**: Visible focus indicators on all interactive elements (2px ring with offset)
- **Color Contrast**: WCAG AA compliant contrast ratios (4.5:1 for text)
- **Reduced Motion**: Respects `prefers-reduced-motion` preference
  - Disables animations and transitions
  - Removes smooth scrolling
- **Responsive Text**: Scales appropriately at all zoom levels

### ARIA Labels

All interactive elements include proper labels:
- "Open chat" / "Close chat" - Floating button
- "Send message" - Send button
- "Close gallery" - Gallery modal close button
- "Previous image" / "Next image" - Gallery navigation
- "View image X of Y" - Gallery thumbnails

### Testing

Run Lighthouse accessibility audit:
```bash
npm run build
npm run preview
# Open Chrome DevTools > Lighthouse > Accessibility
```

Target score: **≥ 90**

### Best Practices

- Tab trapping in modals prevents focus escape
- Escape key closes all overlays
- Focus returns to trigger element on close
- Skip links for keyboard users
- Semantic HTML5 elements

## Deployment

This project is configured for deployment on lovable.app. Follow lovable.app's deployment instructions to deploy your application.

## License

MIT
