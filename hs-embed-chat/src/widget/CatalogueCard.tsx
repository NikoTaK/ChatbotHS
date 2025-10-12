import { CatalogueItem } from './types';

interface CatalogueCardProps {
  item: CatalogueItem;
}

export function CatalogueCard({ item }: CatalogueCardProps) {
  const CardContent = (
    <div className="flex-shrink-0 w-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {item.image && (
        <div className="aspect-video w-full overflow-hidden bg-gray-100">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        {item.subtitle && (
          <p className="text-xs text-hs-text-lighter uppercase tracking-wide mb-1">
            {item.subtitle}
          </p>
        )}
        <h3 className="font-semibold text-hs-text text-sm mb-1 line-clamp-2">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-xs text-hs-text-light mb-2 line-clamp-2">
            {item.description}
          </p>
        )}
        {item.ctaLabel && (
          <p className="text-hs-primary-600 font-semibold text-xs mt-2">
            {item.ctaLabel}
          </p>
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
        className="focus:outline-none focus:ring-2 focus:ring-hs-primary-500 focus:ring-offset-2 rounded-xl"
      >
        {CardContent}
      </a>
    );
  }

  return CardContent;
}
