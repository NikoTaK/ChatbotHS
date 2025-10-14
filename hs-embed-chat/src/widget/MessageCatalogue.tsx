import { CatalogueMessage, CatalogueItem } from './types';
import { prettyTime, cls } from './utils';
import { CatalogueCard } from './CatalogueCard';
import { Bubble } from './Bubble';

interface MessageCatalogueProps {
  message: CatalogueMessage;
}

export function MessageCatalogue({ message }: MessageCatalogueProps) {
  const isUser = message.role === 'user';

  if (!message.items || message.items.length === 0) return null;

  return (
    <div className={cls('flex flex-col', isUser ? 'items-end' : 'items-start')}>
      {message.title && (
        <div className="max-w-[85%] mb-2">
          <Bubble role={message.role}>
            <p className="text-sm leading-relaxed">{message.title}</p>
          </Bubble>
        </div>
      )}

      <div 
        className="w-full overflow-x-auto pb-2 scrollbar-thin snap-x snap-mandatory"
        style={{ 
          scrollbarWidth: 'thin',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="flex gap-3 px-1">
          {message.items.map((item: CatalogueItem) => (
            <CatalogueCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {message.timestamp && (
        <span className="text-xs text-neutral-500 mt-1 px-1">
          {prettyTime(message.timestamp)}
        </span>
      )}
    </div>
  );
}
