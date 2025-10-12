import { EmbedMessage } from './types';
import { formatTime, classNames, parseEmbedUrl } from './utils';

interface MessageEmbedProps {
  message: EmbedMessage;
}

export function MessageEmbed({ message }: MessageEmbedProps) {
  const isUser = message.role === 'user';

  const embedData = parseEmbedUrl(message.url);

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

      <div className="max-w-[85%] w-full rounded-xl overflow-hidden shadow-md bg-white">
        {(embedData.type === 'youtube' || embedData.type === 'vimeo') && (
          <div className="aspect-video">
            <iframe
              src={embedData.url}
              title={message.title || 'Embedded content'}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {embedData.type === 'maps' && (
          <div className="aspect-video">
            <iframe
              src={embedData.url}
              title="Map"
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}

        {embedData.type === 'generic' && (
          <div className="p-4">
            <a
              href={embedData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-hs-primary-600 hover:text-hs-primary-700 text-sm font-medium flex items-center gap-2"
            >
              <span>🔗</span>
              <span className="truncate">{message.title || embedData.url}</span>
            </a>
          </div>
        )}
      </div>

      {message.timestamp && (
        <span className="text-xs text-hs-text-lighter mt-1 px-1">
          {formatTime(message.timestamp)}
        </span>
      )}
    </div>
  );
}
