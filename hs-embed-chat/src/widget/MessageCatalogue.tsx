import { CatalogueMessage, CatalogueItem } from './types';
import { formatTime, classNames } from './utils';
import { CatalogueCard } from './CatalogueCard';

interface MessageCatalogueProps {
  message: CatalogueMessage;
}

export function MessageCatalogue({ message }: MessageCatalogueProps) {
  const isUser = message.role === 'user';

  if (!message.items || message.items.length === 0) return null;

  return (
    <div className={classNames('flex flex-col', isUser ? 'items-end' : 'items-start')}>
      {message.title && (
        <div
          className={classNames(
            'max-w-[85%] rounded-2xl px-4 py-2.5 mb-2',
            isUser ? 'bg-white text-hs-text shadow-sm' : 'bg-indigo-50 text-hs-text'
          )}
        >
          <p className="text-sm leading-relaxed">{message.title}</p>
        </div>
      )}

      <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex gap-3 px-1">
          {message.items.map((item: CatalogueItem) => (
            <CatalogueCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {message.timestamp && (
        <span className="text-xs text-hs-text-lighter mt-1 px-1">
          {formatTime(message.timestamp)}
        </span>
      )}
    </div>
  );
}
