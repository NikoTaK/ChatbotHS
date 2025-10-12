import { useState } from 'react';
import { HSChatWidget } from '../widget/HSChatWidget';

export function DemoPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Demo content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-hs-text mb-4">
            Harbour.Space Chat Widget Demo
          </h1>
          <p className="text-lg text-hs-text-light mb-8">
            Click the chat button in the bottom-right corner to start a conversation with our assistant.
          </p>

          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold text-hs-text mb-4">Features</h2>
            <ul className="space-y-3 text-hs-text-light">
              <li className="flex items-start gap-3">
                <span className="text-hs-primary-600 mt-1">✓</span>
                <span>Responsive chat widget with smooth animations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-hs-primary-600 mt-1">✓</span>
                <span>Support for text messages, galleries, embeds, and catalogues</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-hs-primary-600 mt-1">✓</span>
                <span>Multiline input with Enter to send, Shift+Enter for new line</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-hs-primary-600 mt-1">✓</span>
                <span>Full-screen gallery modal with carousel navigation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-hs-primary-600 mt-1">✓</span>
                <span>Accessible with keyboard navigation and focus states</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-hs-primary-600 mt-1">✓</span>
                <span>Reduced motion support for better accessibility</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-semibold text-hs-text mb-4">Integration</h2>
            <p className="text-hs-text-light mb-4">
              This widget can be easily embedded into any website. Simply include the widget component
              and customize it to match your brand.
            </p>
            <pre className="bg-gray-50 rounded-lg p-4 text-sm overflow-x-auto">
              <code className="text-hs-text">{`import { HSChatWidget } from './widget/HSChatWidget';

function App() {
  return <HSChatWidget />;
}`}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Floating chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-hs-primary-600 to-hs-primary-500 text-white rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-hs-primary-300 transition-all hover:scale-110 z-40"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-24 right-6 w-[420px] h-[560px] transition-all duration-300 ease-in-out z-40 ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ maxWidth: 'calc(100vw - 48px)' }}
      >
        <HSChatWidget />
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default DemoPage;
