import { CatalogueItem } from './types';

interface CatalogueCardProps {
  item: CatalogueItem;
}

export function CatalogueCard({ item }: CatalogueCardProps) {
  const CardContent = (
    <div className="flex-shrink-0 w-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {item.imageUrl && (
        <div className="aspect-video w-full overflow-hidden bg-gray-100">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-hs-text text-sm mb-1 line-clamp-2">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-xs text-hs-text-light mb-2 line-clamp-2">
            {item.description}
          </p>
        )}
        {item.price && (
          <p className="text-hs-primary-600 font-bold text-sm">
            {item.price}
          </p>
        )}
      </div>
    </div>
  );

  if (item.link) {
    return (
      <a
        href={item.link}
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
