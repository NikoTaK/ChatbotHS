import { CatalogueItem } from './types';

interface CatalogueCardProps {
  item: CatalogueItem;
}

export function CatalogueCard({ item }: CatalogueCardProps) {
  const CardContent = (
    <div className="flex-shrink-0 w-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all snap-start">
      {item.image && (
        <div className="aspect-video w-full overflow-hidden bg-gray-100">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-4">
        {item.subtitle && (
          <p className="text-xs text-hs-text-lighter uppercase tracking-wide mb-1 font-medium">
            {item.subtitle}
          </p>
        )}
        <h3 className="font-semibold text-hs-text text-base mb-1 line-clamp-2">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-xs text-hs-text-light mb-3 line-clamp-2">
            {item.description}
          </p>
        )}
        {item.ctaLabel && (
          <button 
            className="w-full bg-hs-primary-600 hover:bg-hs-primary-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors"
            aria-label={item.ctaLabel}
          >
            {item.ctaLabel}
          </button>
        )}
      </div>
    </div>
  );

  if (item.ctaHref) {
    return (
      <a
        href={item.ctaHref}
        target="_blank"
        rel="noopener noreferrer"
        className="focus:outline-none focus:ring-2 focus:ring-hs-primary-500 focus:ring-offset-2 rounded-xl block"
      >
        {CardContent}
      </a>
    );
  }

  return CardContent;
}
