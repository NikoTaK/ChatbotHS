import { useState, useRef, KeyboardEvent } from 'react';

interface InputBarProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function InputBar({ onSend, disabled = false }: InputBarProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Type your message..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-hs-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed max-h-[120px] overflow-y-auto"
          style={{ minHeight: '42px' }}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="flex-shrink-0 bg-gradient-to-r from-hs-primary-600 to-hs-primary-500 text-white rounded-full p-2.5 hover:from-hs-primary-700 hover:to-hs-primary-600 focus:outline-none focus:ring-2 focus:ring-hs-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          aria-label="Send message"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      <p className="text-xs text-hs-text-lighter mt-2 px-1">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
