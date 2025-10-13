import { useState, useEffect } from 'react';
import { HSChatWidget } from '../widget/HSChatWidget';

const features = [
  {
    icon: '💬',
    title: 'Text Messages',
    description: 'Rich text with auto-linking and markdown support',
  },
  {
    icon: '🖼️',
    title: 'Gallery',
    description: 'Image galleries with full-screen modal carousel',
  },
  {
    icon: '📺',
    title: 'Embeds',
    description: 'YouTube, Vimeo, and Google Maps integration',
  },
  {
    icon: '📚',
    title: 'Catalogue',
    description: 'Horizontal scrolling cards with CTAs',
  },
  {
    icon: '⌨️',
    title: 'Multiline Input',
    description: 'Auto-resize with Enter to send, Shift+Enter for newline',
  },
];

export function DemoPage() {
  const [isOpen, setIsOpen] = useState(false);

  // ESC key to close chat panel
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-hs-text mb-6 leading-tight">
            Embeddable Chat Widget Prototype
          </h1>
          <p className="text-lg md:text-xl text-hs-text-light mb-12 max-w-2xl mx-auto">
            Click the chat bubble to open the Harbour.Space assistant.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 text-left"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-hs-text mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-hs-text-light">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm p-8 max-w-2xl mx-auto">
            <p className="text-hs-text-light text-sm leading-relaxed">
              This prototype demonstrates a fully-featured embeddable chat widget with support for
              multiple message types, rich media, and an intuitive user interface. Built with React,
              TypeScript, and Tailwind CSS.
            </p>
          </div>
        </div>
      </div>

      {/* Floating chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-hs-primary-600 to-hs-primary-500 text-white rounded-full shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-hs-primary-300 transition-all z-50 ${
          isOpen ? 'scale-100 rotate-0' : 'scale-100 hover:scale-110'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {isOpen ? (
            <svg 
              className="w-7 h-7 transition-transform duration-200" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg 
              className="w-7 h-7 transition-transform duration-200" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
              />
            </svg>
          )}
        </div>
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-24 right-6 w-full max-w-[420px] h-[600px] max-h-[calc(100vh-120px)] transition-all duration-300 ease-out z-40 ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
        }`}
        style={{ 
          maxWidth: 'calc(100vw - 48px)',
        }}
      >
        <div className="w-full h-full shadow-2xl rounded-2xl overflow-hidden">
          <HSChatWidget />
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-label="Close chat"
        />
      )}
    </div>
  );
}

export default DemoPage;
