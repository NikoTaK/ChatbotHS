export type EmbedType = 'youtube' | 'vimeo' | 'maps' | 'generic';

export interface ParsedEmbed {
  url: string;
  type: EmbedType;
}

export function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function parseEmbedUrl(url: string): ParsedEmbed {
  // YouTube
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return {
      url: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      type: 'youtube',
    };
  }

  // Vimeo
  const vimeoRegex = /vimeo\.com\/(?:.*\/)?(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return {
      url: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      type: 'vimeo',
    };
  }

  // Google Maps
  if (url.includes('google.com/maps')) {
    return {
      url,
      type: 'maps',
    };
  }

  // Generic
  return {
    url,
    type: 'generic',
  };
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
