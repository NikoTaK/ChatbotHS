import { useState } from 'react';
import { Message, TextMessage, GalleryMessage, EmbedMessage, CatalogueMessage } from './types';

const mockMessages: Message[] = [
  // 1. Welcome message
  {
    id: '1',
    type: 'text',
    role: 'assistant',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    text: 'Welcome to Harbour.Space! I\'m your HS assistant. Ask me about programmes, admissions, scholarships, or campus life.',
  } as TextMessage,
  
  // 2. Campus intro video embed
  {
    id: '2',
    type: 'embed',
    role: 'assistant',
    timestamp: new Date(Date.now() - 240000).toISOString(),
    title: 'Campus intro video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Replace with actual HS video
  } as EmbedMessage,
  
  // 3. Campus gallery
  {
    id: '3',
    type: 'gallery',
    role: 'assistant',
    timestamp: new Date(Date.now() - 180000).toISOString(),
    title: 'Our Barcelona campus:',
    images: [
      {
        id: 'g1',
        src: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80',
        alt: 'Modern campus building exterior',
      },
      {
        id: 'g2',
        src: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80',
        alt: 'Collaborative study space',
      },
      {
        id: 'g3',
        src: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
        alt: 'University library',
      },
      {
        id: 'g4',
        src: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80',
        alt: 'Lecture hall',
      },
      {
        id: 'g5',
        src: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&q=80',
        alt: 'Student lounge area',
      },
      {
        id: 'g6',
        src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
        alt: 'Tech lab workspace',
      },
    ],
  } as GalleryMessage,
  
  // 4. Programme catalogue
  {
    id: '4',
    type: 'catalogue',
    role: 'assistant',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    title: 'Explore HS programmes',
    items: [
      {
        id: 'prog1',
        title: 'Computer Science',
        subtitle: 'Master\'s Degree',
        description: 'Build cutting-edge software and systems with industry leaders',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
        ctaLabel: 'Learn more',
        ctaHref: 'https://harbour.space/programmes/computer-science',
      },
      {
        id: 'prog2',
        title: 'Data Science',
        subtitle: 'Master\'s Degree',
        description: 'Master AI, machine learning, and big data analytics',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80',
        ctaLabel: 'Learn more',
        ctaHref: 'https://harbour.space/programmes/data-science',
      },
      {
        id: 'prog3',
        title: 'Cyber Security',
        subtitle: 'Master\'s Degree',
        description: 'Protect digital infrastructure and combat cyber threats',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80',
        ctaLabel: 'Learn more',
        ctaHref: 'https://harbour.space/programmes/cyber-security',
      },
      {
        id: 'prog4',
        title: 'Digital Marketing',
        subtitle: 'Master\'s Degree',
        description: 'Drive growth through data-driven marketing strategies',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
        ctaLabel: 'Learn more',
        ctaHref: 'https://harbour.space/programmes/digital-marketing',
      },
      {
        id: 'prog5',
        title: 'Product Management',
        subtitle: 'Master\'s Degree',
        description: 'Lead product development from concept to launch',
        image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&q=80',
        ctaLabel: 'Learn more',
        ctaHref: 'https://harbour.space/programmes/product-management',
      },
      {
        id: 'prog6',
        title: 'FinTech',
        subtitle: 'Master\'s Degree',
        description: 'Innovate at the intersection of finance and technology',
        image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80',
        ctaLabel: 'Learn more',
        ctaHref: 'https://harbour.space/programmes/fintech',
      },
      {
        id: 'prog7',
        title: 'Interaction Design',
        subtitle: 'Master\'s Degree',
        description: 'Create intuitive and beautiful user experiences',
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80',
        ctaLabel: 'Learn more',
        ctaHref: 'https://harbour.space/programmes/interaction-design',
      },
      {
        id: 'prog8',
        title: 'High-Tech Entrepreneurship',
        subtitle: 'Master\'s Degree',
        description: 'Launch and scale your own tech startup',
        image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&q=80',
        ctaLabel: 'Learn more',
        ctaHref: 'https://harbour.space/programmes/entrepreneurship',
      },
    ],
  } as CatalogueMessage,
  
  // 5. Prompt for interaction
  {
    id: '5',
    type: 'text',
    role: 'assistant',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    text: 'Send me a YouTube/Vimeo/Maps link and I\'ll embed it, or type \'catalogue\' to see options.',
  } as TextMessage,
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

    // Simulate assistant response based on keywords
    setTimeout(() => {
      const trimmedText = text.trim().toLowerCase();
      
      // Check for "catalogue" keyword
      if (trimmedText === 'catalogue' || trimmedText === 'catalog') {
        addMessage({
          type: 'catalogue',
          role: 'assistant',
          title: 'Here are our available programmes:',
          items: [
            {
              id: 'prog1',
              title: 'Computer Science',
              subtitle: 'Master\'s Degree',
              description: 'Build cutting-edge software and systems with industry leaders',
              image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
              ctaLabel: 'Learn more',
              ctaHref: 'https://harbour.space/programmes/computer-science',
            },
            {
              id: 'prog2',
              title: 'Data Science',
              subtitle: 'Master\'s Degree',
              description: 'Master AI, machine learning, and big data analytics',
              image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80',
              ctaLabel: 'Learn more',
              ctaHref: 'https://harbour.space/programmes/data-science',
            },
            {
              id: 'prog3',
              title: 'Cyber Security',
              subtitle: 'Master\'s Degree',
              description: 'Protect digital infrastructure and combat cyber threats',
              image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80',
              ctaLabel: 'Learn more',
              ctaHref: 'https://harbour.space/programmes/cyber-security',
            },
            {
              id: 'prog4',
              title: 'Digital Marketing',
              subtitle: 'Master\'s Degree',
              description: 'Drive growth through data-driven marketing strategies',
              image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
              ctaLabel: 'Learn more',
              ctaHref: 'https://harbour.space/programmes/digital-marketing',
            },
            {
              id: 'prog5',
              title: 'Product Management',
              subtitle: 'Master\'s Degree',
              description: 'Lead product development from concept to launch',
              image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&q=80',
              ctaLabel: 'Learn more',
              ctaHref: 'https://harbour.space/programmes/product-management',
            },
            {
              id: 'prog6',
              title: 'FinTech',
              subtitle: 'Master\'s Degree',
              description: 'Innovate at the intersection of finance and technology',
              image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80',
              ctaLabel: 'Learn more',
              ctaHref: 'https://harbour.space/programmes/fintech',
            },
            {
              id: 'prog7',
              title: 'Interaction Design',
              subtitle: 'Master\'s Degree',
              description: 'Create intuitive and beautiful user experiences',
              image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80',
              ctaLabel: 'Learn more',
              ctaHref: 'https://harbour.space/programmes/interaction-design',
            },
            {
              id: 'prog8',
              title: 'High-Tech Entrepreneurship',
              subtitle: 'Master\'s Degree',
              description: 'Launch and scale your own tech startup',
              image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&q=80',
              ctaLabel: 'Learn more',
              ctaHref: 'https://harbour.space/programmes/entrepreneurship',
            },
          ],
        } as Omit<CatalogueMessage, 'id' | 'timestamp'>);
        return;
      }
      
      // Check for embeddable URLs (YouTube, Vimeo, Google Maps)
      const urlRegex = /(https?:\/\/[^\s]+)/;
      const urlMatch = text.match(urlRegex);
      
      if (urlMatch) {
        const url = urlMatch[0];
        const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
        const isVimeo = url.includes('vimeo.com');
        const isMaps = url.includes('google.com/maps') || url.includes('goo.gl/maps');
        
        if (isYouTube || isVimeo || isMaps) {
          const embedTitle = isYouTube ? 'YouTube video' : isVimeo ? 'Vimeo video' : 'Google Maps location';
          
          addMessage({
            type: 'embed',
            role: 'assistant',
            title: `Here's your ${embedTitle}:`,
            url: url,
          } as Omit<EmbedMessage, 'id' | 'timestamp'>);
          return;
        }
      }
      
      // Default text response
      const responseText = text.length > 50 
        ? `I received your message (${text.length} characters). Try typing "catalogue" or paste a YouTube/Vimeo/Maps link!`
        : `Got it: "${text}". Try typing "catalogue" or paste a YouTube/Vimeo/Maps link!`;
      
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
