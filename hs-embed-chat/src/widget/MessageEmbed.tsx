import { EmbedMessage } from './types';
import { prettyTime, cls, getEmbedHTML } from './utils';
import { Bubble } from './Bubble';

interface MessageEmbedProps {
  message: EmbedMessage;
}

export function MessageEmbed({ message }: MessageEmbedProps) {
  const isUser = message.role === 'user';
  const embedHTML = getEmbedHTML(message.url);

  return (
    <div className={cls('flex flex-col', isUser ? 'items-end' : 'items-start')}>
      {message.title && (
        <div className="max-w-[85%] mb-2">
          <Bubble role={message.role}>
            <p className="text-sm leading-relaxed">{message.title}</p>
          </Bubble>
        </div>
      )}

      <div className="max-w-[85%] w-full rounded-xl overflow-hidden shadow-md bg-white">
        <div 
          className="aspect-video w-full"
          dangerouslySetInnerHTML={{ __html: embedHTML }}
        />
      </div>

      {message.timestamp && (
        <span className="text-xs text-hs-text-lighter mt-1 px-1">
          {prettyTime(message.timestamp)}
        </span>
      )}
    </div>
  );
}
