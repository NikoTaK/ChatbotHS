import { useState } from 'react';
import { Message } from './types';
import { formatTime, classNames } from './utils';
import { GalleryModal } from './GalleryModal';

interface MessageGalleryProps {
  message: Message;
}

export function MessageGallery({ message }: MessageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const isUser = message.sender === 'user';

  if (!message.gallery || message.gallery.length === 0) return null;

  return (
    <>
      <div className={classNames('flex flex-col', isUser ? 'items-end' : 'items-start')}>
        {message.content && (
          <div
            className={classNames(
              'max-w-[85%] rounded-2xl px-4 py-2.5 mb-2',
              isUser ? 'bg-white text-hs-text shadow-sm' : 'bg-indigo-50 text-hs-text'
            )}
          >
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-2 max-w-[85%]">
          {message.gallery.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className="aspect-square rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-hs-primary-500 focus:ring-offset-2 transition-transform hover:scale-105"
            >
              <img
                src={image.thumbnail || image.url}
                alt={image.caption || `Gallery image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        <span className="text-xs text-hs-text-lighter mt-1 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>

      {selectedIndex !== null && (
        <GalleryModal
          images={message.gallery}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  );
}
