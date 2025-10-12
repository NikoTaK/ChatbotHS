export type MessageType = 'text' | 'gallery' | 'embed' | 'catalogue';

export interface CatalogueItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: string;
  link?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  thumbnail?: string;
  caption?: string;
}

export interface EmbedContent {
  url: string;
  type?: 'youtube' | 'vimeo' | 'maps' | 'generic';
  title?: string;
}

export interface Message {
  id: string;
  type: MessageType;
  sender: 'user' | 'assistant';
  timestamp: Date;
  content?: string;
  gallery?: GalleryImage[];
  embed?: EmbedContent;
  catalogue?: CatalogueItem[];
}
