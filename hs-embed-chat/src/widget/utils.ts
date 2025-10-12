export type EmbedType = 'youtube' | 'vimeo' | 'maps' | 'generic';

export interface ParsedEmbed {
  url: string;
  type: EmbedType;
}

/**
 * Simple classNames combiner
 * Filters out falsy values and joins with spaces
 */
export function cls(...parts: (string | boolean | undefined | null)[]): string {
  return parts.filter(Boolean).join(' ');
}

// Keep classNames as alias for backward compatibility
export const classNames = cls;

/**
 * Format ISO timestamp to HH:MM format
 * Returns empty string if timestamp is invalid or missing
 */
export function prettyTime(iso?: string): string {
  if (!iso) return '';
  
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return '';
    
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return '';
  }
}

// Keep formatTime for backward compatibility
export const formatTime = prettyTime;

/**
 * Extract video ID from YouTube URL
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^"&?\/\s]{11})/,
    /youtube\.com\/embed\/([^"&?\/\s]{11})/,
    /youtube\.com\/v\/([^"&?\/\s]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * Extract video ID from Vimeo URL
 */
function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
  return match ? match[1] : null;
}

/**
 * Generate safe embed HTML for various URL types
 * Returns iframe HTML string with security attributes
 */
export function getEmbedHTML(url: string): string {
  // YouTube
  const youtubeId = extractYouTubeId(url);
  if (youtubeId) {
    return `<iframe 
      src="https://www.youtube-nocookie.com/embed/${youtubeId}" 
      width="100%" 
      height="100%" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"
      sandbox="allow-scripts allow-same-origin allow-presentation"
    ></iframe>`;
  }

  // Vimeo
  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    return `<iframe 
      src="https://player.vimeo.com/video/${vimeoId}" 
      width="100%" 
      height="100%" 
      frameborder="0" 
      allow="autoplay; fullscreen; picture-in-picture" 
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"
      sandbox="allow-scripts allow-same-origin allow-presentation"
    ></iframe>`;
  }

  // Google Maps
  if (url.includes('google.com/maps')) {
    return `<iframe 
      src="${url}" 
      width="100%" 
      height="100%" 
      frameborder="0" 
      style="border:0" 
      allowfullscreen
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      sandbox="allow-scripts allow-same-origin"
    ></iframe>`;
  }

  // Generic - most restrictive sandbox
  return `<iframe 
    src="${url}" 
    width="100%" 
    height="100%" 
    frameborder="0" 
    referrerpolicy="strict-origin-when-cross-origin"
    sandbox="allow-scripts allow-same-origin"
  ></iframe>`;
}

/**
 * Parse embed URL and return type and processed URL
 * @deprecated Use getEmbedHTML for generating embed markup
 */
export function parseEmbedUrl(url: string): ParsedEmbed {
  const youtubeId = extractYouTubeId(url);
  if (youtubeId) {
    return {
      url: `https://www.youtube-nocookie.com/embed/${youtubeId}`,
      type: 'youtube',
    };
  }

  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    return {
      url: `https://player.vimeo.com/video/${vimeoId}`,
      type: 'vimeo',
    };
  }

  if (url.includes('google.com/maps')) {
    return {
      url,
      type: 'maps',
    };
  }

  return {
    url,
    type: 'generic',
  };
}

/**
 * Validate if string is a valid URL
 */
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}
