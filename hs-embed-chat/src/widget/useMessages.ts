import { useState } from 'react';
import { Message } from './types';

const mockMessages: Message[] = [
  {
    id: '1',
    type: 'text',
    sender: 'assistant',
    timestamp: new Date(Date.now() - 60000),
    content: 'Hello! I\'m the Harbour.Space Assistant. How can I help you today?',
  },
  {
    id: '2',
    type: 'text',
    sender: 'user',
    timestamp: new Date(Date.now() - 45000),
    content: 'Can you show me some campus photos?',
  },
  {
    id: '3',
    type: 'gallery',
    sender: 'assistant',
    timestamp: new Date(Date.now() - 30000),
    content: 'Here are some photos of our campus:',
    gallery: [
      {
        id: 'g1',
        url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1562774053-701939374585?w=200',
        caption: 'Campus Building',
      },
      {
        id: 'g2',
        url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200',
        caption: 'Study Area',
      },
      {
        id: 'g3',
        url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200',
        caption: 'Library',
      },
    ],
  },
];

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const sendUserMessage = (content: string) => {
    addMessage({
      type: 'text',
      sender: 'user',
      content,
    });

    // Simulate assistant response
    setTimeout(() => {
      addMessage({
        type: 'text',
        sender: 'assistant',
        content: 'Thanks for your message! This is a demo response.',
      });
    }, 1000);
  };

  return {
    messages,
    sendUserMessage,
  };
}
