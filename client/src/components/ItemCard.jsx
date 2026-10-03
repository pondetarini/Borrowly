import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Tag, ImageOff, Sparkles } from 'lucide-react';

export const ItemCard = ({ item, showAiScore = false }) => {
  const itemUrl = `/items/${item.id || item._id}`;
  const isFree = Number(item.pricePerDay) === 0;
  const availability = item.status?.toLowerCase() === 'active' ? 'Available' : 'Unavailable';

  return (
    <article className="item-card group">
      <Link to={itemUrl} className="item-card-image" aria-label={`View ${item.title}`}>
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.title} loading="lazy" />
        ) : (
          <span className="item-image-placeholder" aria-hidden="true"><ImageOff className="h-7 w-7" /></span>
        )}
        {item.category && <span className="item-category"><Tag className="h-3 w-3" />{item.category}</span>}
        <span className="item-availability">{availability}</span>
        {showAiScore && item.aiScore && (
          <span className="item-ai-score">
            <Sparkles className="h-3.5 w-3.5" /> {item.aiScore}% match
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-400">
          {item.condition && <span>{item.condition} condition</span>}
          <span className="font-medium text-slate-700">
            {isFree ? 'Free to borrow' : `$${item.pricePerDay}/day`}
          </span>
        </div>
        <Link to={itemUrl} className="item-card-title">{item.title}</Link>
        {item.ownerName && <p className="mt-1 text-sm text-slate-400">Shared by {item.ownerName}</p>}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-800 pt-3">
          <span className="flex min-w-0 items-center gap-1.5 text-sm text-slate-400">
            <MapPin className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="truncate">{item.location}</span>
          </span>
          <Link to={itemUrl} className="button-card-action">Borrow item</Link>
        </div>
      </div>
    </article>
  );
};

export default ItemCard;
