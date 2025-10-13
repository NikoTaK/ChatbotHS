# HS Chat Widget - Embed API

## Quick Start

Add the widget to any website with just two lines of code:

```html
<script src="/widget.js"></script>
<script>
  window.HSChatWidget.init({ position: "bottom-right" });
</script>
```

## API Reference

### `window.HSChatWidget.init(options)`

Initialize the chat widget with custom options.

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | `string \| HTMLElement` | `document.body` | CSS selector or DOM element to mount the widget |
| `position` | `'bottom-right' \| 'bottom-left'` | `'bottom-right'` | Position of the floating button |
| `theme` | `object` | `{}` | Theme customization options |
| `theme.primary` | `string` | `'#9333ea'` | Primary color (hex or CSS color) |
| `theme.borderRadius` | `string` | `'1rem'` | Border radius for UI elements |
| `showLauncher` | `boolean` | `true` | Show/hide the floating launcher button |

#### Examples

**Basic Usage:**
```html
<script src="/widget.js"></script>
<script>
  window.HSChatWidget.init();
</script>
```

**Custom Position:**
```html
<script>
  window.HSChatWidget.init({
    position: 'bottom-left'
  });
</script>
```

**Custom Theme:**
```html
<script>
  window.HSChatWidget.init({
    position: 'bottom-right',
    theme: {
      primary: '#6366f1',
      borderRadius: '0.5rem'
    }
  });
</script>
```

**Custom Container:**
```html
<div id="chat-container"></div>
<script>
  window.HSChatWidget.init({
    container: '#chat-container',
    showLauncher: false
  });
</script>
```

### `window.HSChatWidget.destroy()`

Remove the widget from the page.

```javascript
window.HSChatWidget.destroy();
```

## Development

### Testing the Embed API

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Visit `/widget-embed.html` to see the embed API in action

3. Or uncomment the embed script in `index.html` to test

### Building for Production

```bash
npm run build
```

This will generate:
- `dist/widget.js` - Standalone widget bundle
- `dist/index.html` - Demo page

### Integration Notes

- The widget is self-contained with all styles bundled
- No external dependencies required on the host page
- Automatically handles React mounting and unmounting
- Safe to use with other JavaScript frameworks
- Mobile-responsive with touch support

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT
