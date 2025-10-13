import { useState } from 'react';
import { Message, TextMessage, GalleryMessage } from './types';

const mockMessages: Message[] = [
  {
    id: '1',
    type: 'text',
    role: 'assistant',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    text: 'Hello! I\'m the Harbour.Space Assistant. How can I help you today?',
  } as TextMessage,
  {
    id: '2',
    type: 'text',
    role: 'user',
    timestamp: new Date(Date.now() - 45000).toISOString(),
    text: 'Can you show me some campus photos?',
  } as TextMessage,
  {
    id: '3',
    type: 'gallery',
    role: 'assistant',
    timestamp: new Date(Date.now() - 30000).toISOString(),
    title: 'Here are some photos of our campus:',
    images: [
      {
        id: 'g1',
        src: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
        alt: 'Campus Building',
      },
      {
        id: 'g2',
        src: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
        alt: 'Study Area',
      },
      {
        id: 'g3',
        src: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
        alt: 'Library',
      },
    ],
  } as GalleryMessage,
];

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    } as Message;
    setMessages((prev) => [...prev, newMessage]);
  };

  const sendUserMessage = (text: string) => {
    // Add user message
    addMessage({
      type: 'text',
      role: 'user',
      text,
    } as Omit<TextMessage, 'id' | 'timestamp'>);

    // Simulate assistant response acknowledging the message
    setTimeout(() => {
      const responseText = text.length > 50 
        ? `I received your message (${text.length} characters). This is a demo response - in production, this would connect to a real assistant.`
        : `Thanks for your message: "${text}". This is a demo response - in production, this would connect to a real assistant.`;
      
      addMessage({
        type: 'text',
        role: 'assistant',
        text: responseText,
      } as Omit<TextMessage, 'id' | 'timestamp'>);
    }, 1000);
  };

  return {
    messages,
    sendUserMessage,
  };
}
