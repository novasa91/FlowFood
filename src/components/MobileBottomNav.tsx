import { 
  Home, 
  Bike, 
  MessageCircle, 
  PhoneCall, 
  ShoppingBag,
  Clock
} from 'lucide-react';
import { Order } from '../types';

interface MobileBottomNavProps {
  currentTab: 'home' | 'tracking';
  onSelectTab: (tab: 'home' | 'tracking') => void;
  activeOrder: Order | null;
  unreadNotificationsCount: number;
  onOpenLineNotifications: () => void;
  onOpenQuickCall: () => void;
  cartCount: number;
  onOpenCart: () => void;
}

export function MobileBottomNav({
  currentTab,
  onSelectTab,
  activeOrder,
  unreadNotificationsCount,
  onOpenLineNotifications,
  onOpenQuickCall,
  cartCount,
  onOpenCart,
}: MobileBottomNavProps) {
  const hasActiveOrder = activeOrder && activeOrder.status !== 'delivered';

  return (
    <nav 
      aria-label="เมนูหลักบนมือถือ"
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {/* 1. Home / Market */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            currentTab === 'home' ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5" />
            {currentTab === 'home' && (
              <span className="w-1 h-1 bg-orange-600 rounded-full mx-auto mt-0.5 block" />
            )}
          </div>
          <span className="text-[10px] mt-0.5">เมนูอาหาร</span>
        </button>

        {/* 2. Live Tracking / Rider */}
        <button
          type="button"
          onClick={() => onSelectTab('tracking')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative ${
            currentTab === 'tracking' ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Bike className="w-5 h-5" />
            {hasActiveOrder && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">ติดตามสด</span>
        </button>

        {/* 3. In-App Call Button (Center highlighted) */}
        <button
          type="button"
          onClick={onOpenQuickCall}
          className="flex flex-col items-center justify-center h-full min-h-[44px] text-slate-700 hover:text-orange-600 transition-colors group"
        >
          <div className="w-10 h-10 -mt-3 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30 group-active:scale-90 transition-transform">
            <PhoneCall className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold text-orange-700 mt-0.5">โทรในแอป</span>
        </button>

        {/* 4. LINE Notifications */}
        <button
          type="button"
          onClick={onOpenLineNotifications}
          className="flex flex-col items-center justify-center h-full min-h-[44px] text-slate-500 hover:text-[#06C755] transition-colors relative"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#06C755] text-white text-[9px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">แจ้งเตือน LINE</span>
        </button>

        {/* 5. Cart */}
        <button
          type="button"
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center h-full min-h-[44px] text-slate-500 hover:text-orange-600 transition-colors relative"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">ตะกร้า</span>
        </button>
      </div>
    </nav>
  );
}
