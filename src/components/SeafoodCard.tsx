import { Plus, Star, Clock, Sparkles } from 'lucide-react';
import { SeafoodItem } from '../types';

interface SeafoodCardProps {
  item: SeafoodItem;
  onSelectItem: (item: SeafoodItem) => void;
  cartQuantityForItem: number;
}

export function SeafoodCard({ item, onSelectItem, cartQuantityForItem }: SeafoodCardProps) {
  return (
    <div
      onClick={() => onSelectItem(item)}
      className="group bg-white rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer relative"
    >
      {/* Top Image Container */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badge on top-left */}
        {item.badge && (
          <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-xs">
            {item.badge}
          </div>
        )}

        {/* Prep Time pill top-right */}
        <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
          <Clock className="w-3.5 h-3.5 text-orange-600" />
          <span>{item.prepTimeMinutes} นาที</span>
        </div>

        {/* Cart quantity badge if in cart */}
        {cartQuantityForItem > 0 && (
          <div className="absolute bottom-2.5 right-2.5 bg-orange-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 animate-in fade-in zoom-in">
            <span>สั่งแล้ว {cartQuantityForItem}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Freshness source */}
          <div className="flex items-center gap-1 text-[11px] text-orange-700 font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span className="truncate">{item.freshnessSource}</span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug line-clamp-1 group-hover:text-orange-600 transition-colors">
            {item.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <div className="flex items-center text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-0.5" />
              <span>{item.rating}</span>
            </div>
            <span>•</span>
            <span>({item.reviewCount} รีวิว)</span>
          </div>
        </div>

        {/* Price & Action Button Footer */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-900">
                ฿{item.price.toLocaleString()}
              </span>
              {item.originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ฿{item.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 block -mt-0.5">
              เลือกขนาด &amp; วิธีปรุงได้
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectItem(item);
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 hover:bg-orange-500 text-orange-700 hover:text-white rounded-xl font-bold text-xs transition-colors shadow-2xs group-hover:bg-orange-500 group-hover:text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เลือก</span>
          </button>
        </div>
      </div>
    </div>
  );
}
