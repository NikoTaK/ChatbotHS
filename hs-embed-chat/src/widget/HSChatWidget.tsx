import { useEffect, useRef } from 'react';
import { useMessages } from './useMessages';
import { MessageText } from './MessageText';
import { MessageGallery } from './MessageGallery';
import { MessageEmbed } from './MessageEmbed';
import { MessageCatalogue } from './MessageCatalogue';
import { InputBar } from './InputBar';

export function HSChatWidget() {
  const { messages, sendUserMessage } = useMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMessage = (message: typeof messages[0]) => {
    const isUser = message.sender === 'user';
    
    return (
      <div key={message.id} className="flex gap-3 mb-4">
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-hs-primary-600 to-hs-primary-400 flex items-center justify-center text-white text-xs font-semibold">
            HS
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {message.type === 'text' && <MessageText message={message} />}
          {message.type === 'gallery' && <MessageGallery message={message} />}
          {message.type === 'embed' && <MessageEmbed message={message} />}
          {message.type === 'catalogue' && <MessageCatalogue message={message} />}
        </div>

        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-hs-bg rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-hs-primary-600 to-hs-primary-500 text-white px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
          HS
        </div>
        <div>
          <h2 className="font-semibold text-base">Harbour.Space Assistant</h2>
          <p className="text-xs text-white/80">Always here to help</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <InputBar onSend={sendUserMessage} />
    </div>
  );
}
