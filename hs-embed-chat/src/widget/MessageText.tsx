import { TextMessage } from './types';
import { prettyTime, cls } from './utils';
import { Bubble } from './Bubble';

interface MessageTextProps {
  message: TextMessage;
}

/**
 * Auto-link URLs in text
 * Converts plain URLs to clickable links with security attributes
 */
function linkifyText(text: string): (string | JSX.Element)[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-hs-primary-600 hover:text-hs-primary-700 underline"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

export function MessageText({ message }: MessageTextProps) {
  const isUser = message.role === 'user';
  const linkedText = linkifyText(message.text);

  return (
    <div className={cls('flex flex-col', isUser ? 'items-end' : 'items-start')}>
      <div className="max-w-[85%]">
        <Bubble role={message.role}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {linkedText}
          </p>
        </Bubble>
      </div>
      {message.timestamp && (
        <span className="text-xs text-hs-text-lighter mt-1 px-1">
          {prettyTime(message.timestamp)}
        </span>
      )}
    </div>
  );
}
