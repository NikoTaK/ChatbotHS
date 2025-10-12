export type UserRole = "user" | "assistant" | "system";

export type BaseMessage = {
  id: string;
  role: UserRole;
  timestamp?: string;
};

export type TextMessage = BaseMessage & {
  type: "text";
  text: string;
};

export type GalleryImage = { 
  id: string; 
  src: string; 
  alt?: string; 
};

export type GalleryMessage = BaseMessage & {
  type: "gallery";
  title?: string;
  images: GalleryImage[];
};

export type EmbedMessage = BaseMessage & {
  type: "embed";
  title?: string;
  url: string; // youtube, vimeo, gmaps, any embeddable
};

export type CatalogueItem = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type CatalogueMessage = BaseMessage & {
  type: "catalogue";
  title?: string;
  items: CatalogueItem[];
};

export type Message =
  | TextMessage
  | GalleryMessage
  | EmbedMessage
  | CatalogueMessage;
