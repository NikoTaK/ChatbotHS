import { Message } from './types';
import { formatTime, classNames } from './utils';

interface MessageTextProps {
  message: Message;
}

export function MessageText({ message }: MessageTextProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={classNames('flex flex-col', isUser ? 'items-end' : 'items-start')}>
      <div
        className={classNames(
          'max-w-[85%] rounded-2xl px-4 py-2.5 break-words',
          isUser
            ? 'bg-white text-hs-text shadow-sm'
            : 'bg-indigo-50 text-hs-text'
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
      <span className="text-xs text-hs-text-lighter mt-1 px-1">
        {formatTime(message.timestamp)}
      </span>
    </div>
  );
}
