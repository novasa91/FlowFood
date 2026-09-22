import { ShoppingBag, ChevronRight } from 'lucide-react';

interface FloatingCartBarProps {
  totalItems: number;
  totalPrice: number;
  onOpenCart: () => void;
}

export function FloatingCartBar({ totalItems, totalPrice, onOpenCart }: FloatingCartBarProps) {
  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-4 max-w-xl mx-auto pointer-events-none">
      <div
        onClick={onOpenCart}
        className="pointer-events-auto bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white rounded-2xl p-3.5 shadow-xl flex items-center justify-between cursor-pointer transition-all duration-200 border border-orange-400/40"
      >
        <div className="flex items-center gap-3">
          <div className="relative bg-orange-600/80 p-2 rounded-xl">
            <ShoppingBag className="w-5 h-5 text-white" />
            <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[11px] font-black rounded-full h-5 min-w-5 px-1 flex items-center justify-center shadow-xs">
              {totalItems}
            </span>
          </div>
          <div>
            <div className="text-[11px] text-orange-100 font-medium">ตะกร้าของคุณ ({totalItems} รายการ)</div>
            <div className="text-base font-extrabold text-white">
              ฿{totalPrice.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 font-bold text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-colors">
          <span>ดูตะกร้า</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
