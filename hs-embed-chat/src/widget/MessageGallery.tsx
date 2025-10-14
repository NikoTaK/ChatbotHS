import { useState } from 'react';
import { GalleryMessage, GalleryImage } from './types';
import { prettyTime, cls } from './utils';
import { GalleryModal } from './GalleryModal';
import { Bubble } from './Bubble';

interface MessageGalleryProps {
  message: GalleryMessage;
}

export function MessageGallery({ message }: MessageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const isUser = message.role === 'user';

  if (!message.images || message.images.length === 0) return null;

  // Determine grid columns based on number of images
  const gridCols = message.images.length === 1 ? 'grid-cols-1' : message.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <>
      <div className={cls('flex flex-col', isUser ? 'items-end' : 'items-start')}>
        {message.title && (
          <div className="max-w-[85%] mb-2">
            <Bubble role={message.role}>
              <p className="text-sm leading-relaxed">{message.title}</p>
            </Bubble>
          </div>
        )}
        
        <div className={cls('grid gap-2 max-w-[85%]', gridCols)}>
          {message.images.map((image: GalleryImage, index: number) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className="aspect-square rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-transform hover:scale-105 active:scale-95"
              aria-label={`View image ${index + 1} of ${message.images.length}`}
            >
              <img
                src={image.src}
                alt={image.alt || `Gallery image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {message.timestamp && (
          <span className="text-xs text-neutral-500 mt-1 px-1">
            {prettyTime(message.timestamp)}
          </span>
        )}
      </div>

      {selectedIndex !== null && (
        <GalleryModal
          images={message.images}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  );
}
