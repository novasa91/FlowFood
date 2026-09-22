import { 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Fish, 
  Waves, 
  Utensils, 
  Gift 
} from 'lucide-react';
import { CATEGORIES } from '../data/seafoodData';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-4 h-4" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4" />;
      case 'Fish': return <Fish className="w-4 h-4" />;
      case 'Waves': return <Waves className="w-4 h-4" />;
      case 'Utensils': return <Utensils className="w-4 h-4" />;
      case 'Gift': return <Gift className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="sticky top-[60px] sm:top-[68px] z-30 bg-white/95 backdrop-blur-md py-2.5 px-1 border-b border-slate-100 shadow-2xs mb-6 -mx-2 sm:mx-0 sm:rounded-xl">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none px-2 sm:px-3 pb-0.5">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-orange-500 text-white shadow-xs scale-100 ring-2 ring-orange-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-slate-500'}>
                {getIcon(cat.icon)}
              </span>
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? 'bg-orange-700/60 text-orange-100'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
