import React from 'react';
import ReactDOM from 'react-dom/client';
import DemoPage from '../demo/DemoPage';

interface WidgetOptions {
  container?: string | HTMLElement;
  position?: 'bottom-right' | 'bottom-left';
  theme?: {
    primary?: string;
    borderRadius?: string;
  };
  showLauncher?: boolean;
}

class HSChatWidgetAPI {
  private root: ReactDOM.Root | null = null;
  private containerElement: HTMLElement | null = null;

  init(options: WidgetOptions = {}) {
    const {
      container = document.body,
      position = 'bottom-right',
      theme = {},
      showLauncher = true,
    } = options;

    // Get or create container
    let targetContainer: HTMLElement;
    if (typeof container === 'string') {
      const element = document.querySelector(container);
      if (!element) {
        console.error(`HSChatWidget: Container "${container}" not found`);
        return;
      }
      targetContainer = element as HTMLElement;
    } else {
      targetContainer = container;
    }

    // Create root div
    const rootDiv = document.createElement('div');
    rootDiv.id = 'hs-chat-root';
    rootDiv.style.position = 'relative';
    rootDiv.style.zIndex = '9999';

    // Apply theme customizations
    if (theme.primary) {
      rootDiv.style.setProperty('--hs-primary', theme.primary);
    }
    if (theme.borderRadius) {
      rootDiv.style.setProperty('--hs-border-radius', theme.borderRadius);
    }

    // Apply position styles if using body container
    if (targetContainer === document.body) {
      rootDiv.style.position = 'fixed';
      rootDiv.style.inset = '0';
      rootDiv.style.pointerEvents = 'none';
      
      // Make children interactive
      const style = document.createElement('style');
      style.textContent = `
        #hs-chat-root > * {
          pointer-events: auto;
        }
      `;
      document.head.appendChild(style);
    }

    targetContainer.appendChild(rootDiv);
    this.containerElement = rootDiv;

    // Mount React app
    this.root = ReactDOM.createRoot(rootDiv);
    this.root.render(React.createElement(DemoPage));

    console.log('HSChatWidget initialized', { position, theme, showLauncher });
  }

  destroy() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    if (this.containerElement && this.containerElement.parentNode) {
      this.containerElement.parentNode.removeChild(this.containerElement);
      this.containerElement = null;
    }
  }
}

// Expose to window
declare global {
  interface Window {
    HSChatWidget: HSChatWidgetAPI;
  }
}

if (typeof window !== 'undefined') {
  window.HSChatWidget = new HSChatWidgetAPI();
}

export default HSChatWidgetAPI;
