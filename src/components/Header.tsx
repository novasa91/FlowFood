import { useState } from 'react';
import { 
  MapPin, 
  Search, 
  ShoppingBag, 
  Clock, 
  ChevronDown, 
  Bike,
  Sparkles,
  PhoneCall,
  MessageCircle,
  Store,
  Waves,
  Bot
} from 'lucide-react';
import { Order, MerchantProfile } from '../types';

interface HeaderProps {
  currentAddress: string;
  onOpenAddressModal: () => void;
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeOrder: Order | null;
  onOpenTracking: () => void;
  onOpenHistory: () => void;
  unreadNotificationsCount?: number;
  onOpenLineNotifications?: () => void;
  onOpenInAppCall?: () => void;
  merchant?: MerchantProfile | null;
  onOpenMerchantDashboard?: () => void;
  onOpenMerchantRegistration?: () => void;
  onOpenAgent?: () => void;
}

export function Header({
  currentAddress,
  onOpenAddressModal,
  cartCount,
  onOpenCart,
  searchQuery,
  onSearchChange,
  activeOrder,
  onOpenTracking,
  onOpenHistory,
  unreadNotificationsCount = 0,
  onOpenLineNotifications,
  onOpenInAppCall,
  merchant,
  onOpenMerchantDashboard,
  onOpenMerchantRegistration,
  onOpenAgent,
}: HeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-xs">
      {/* Top Banner if Active Order exists */}
      {activeOrder && activeOrder.status !== 'delivered' && (
        <div className="bg-orange-600 hover:bg-orange-700 text-white px-3 sm:px-4 py-2 transition-colors flex items-center justify-between text-xs sm:text-sm font-medium gap-2">
          <div 
            onClick={onOpenTracking}
            className="flex items-center gap-2 max-w-[70%] sm:max-w-[75%] truncate cursor-pointer"
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <Bike className="w-4 h-4 shrink-0 text-orange-100" />
            <span className="truncate">
              ออเดอร์ #{activeOrder.orderNumber}: {
                activeOrder.status === 'confirmed' ? 'ร้านกุ้งเผาเผา 烤烤 กำลังตรวจสอบ' :
                activeOrder.status === 'cooking' ? 'กำลังเผากุ้งเตาถ่านสดใหม่' :
                activeOrder.status === 'picking_up' ? 'ไรเดอร์ Kǎo Kǎo กำลังไปรับที่ร้าน' :
                'ไรเดอร์ Kǎo Kǎo กำลังมุ่งหน้ามาส่งคุณ'
              } (อีกประมาณ {activeOrder.estimatedDeliveryMinutes} นาที)
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenInAppCall && (
              <button
                type="button"
                onClick={onOpenInAppCall}
                className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                title="โทรหาไรเดอร์ผ่านแอปฟรี"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">โทรไรเดอร์</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenTracking}
              className="underline text-orange-100 hover:text-white font-semibold flex items-center gap-1"
            >
              <span>ติดตาม</span> &gt;
            </button>
          </div>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Brand & Address */}
        <div className="flex items-center justify-between gap-3">
          {/* Logo Badge (Orange Theme) */}
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl overflow-hidden border border-orange-200 shadow-md shadow-orange-500/20 shrink-0 bg-white">
              <img
                src="/images/products/kaokao-logo.jpg"
                alt="Kao Kao Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight tracking-tight">
                  กุ้งเผาเผา <span className="text-orange-600">烤烤</span>
                </span>
                <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                  Kǎo Kǎo
                </span>
                {merchant && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    merchant.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${merchant.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    <span>{merchant.isOpen ? 'เปิดร้าน' : 'ปิดร้านชั่วคราว'}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-none mt-0.5">กุ้งเผาเผา 烤烤 หัวมันแก้วทุกตัว ส่งด่วน 35 นาที</p>
            </div>
          </div>

          {/* Quick Buttons for Mobile */}
          <div className="flex items-center gap-1.5 sm:hidden">
            {/* AI Agent Order Assistant Button Mobile */}
            {onOpenAgent && (
              <button
                onClick={onOpenAgent}
                aria-label="Agent รับออเดอร์"
                className="relative p-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
                title="AI Agent ผู้ช่วยรับออเดอร์"
              >
                <Bot className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-white text-orange-600 font-black text-[9px] px-1 rounded-full shadow-xs">
                  AI
                </span>
              </button>
            )}

            {/* Merchant Button on Mobile */}
            <button
              onClick={merchant ? onOpenMerchantDashboard : onOpenMerchantRegistration}
              aria-label="ร้านค้าของฉัน"
              className="p-2 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center font-bold text-xs gap-1"
              title={merchant ? 'จัดการร้านค้า' : 'สมัครสมาชิกร้านค้า'}
            >
              <Store className="w-5 h-5 text-orange-700" />
            </button>

            {onOpenLineNotifications && (
              <button
                onClick={onOpenLineNotifications}
                aria-label="แจ้งเตือน LINE"
                className="relative p-2 text-[#06C755] hover:bg-orange-50 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <MessageCircle className="w-5 h-5 fill-[#06C755]" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-[9px] font-bold rounded-full h-4 min-w-4 px-0.5 flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={onOpenCart}
              aria-label="ตะกร้าสินค้า"
              className="relative p-2 bg-orange-600 text-white hover:bg-orange-700 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shadow-xs"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Delivery Address Selector */}
        <button
          onClick={onOpenAddressModal}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-left transition-all max-w-full sm:max-w-xs md:max-w-sm group min-h-[44px]"
        >
          <div className="p-1.5 rounded-lg bg-orange-100 text-orange-700 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
              <span>จัดส่งที่</span>
              <span className="text-orange-600 font-bold group-hover:underline">
                (คลิกเพื่อแก้ไข)
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
            </div>
            <div className="text-xs font-semibold text-slate-800 truncate">
              {currentAddress || 'เลือกสถานที่จัดส่ง'}
            </div>
          </div>
        </button>

        {/* Search & Actions Desktop */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className={`relative flex-1 sm:w-48 md:w-56 transition-all ${isSearchFocused ? 'ring-2 ring-orange-500 rounded-xl' : ''}`}>
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="ค้นหากุ้งเผาหัวมันแก้ว 烤烤..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-100 hover:bg-slate-50 focus:bg-white rounded-xl border border-transparent focus:border-orange-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2">
            {/* AI Agent Order Assistant Button Desktop */}
            {onOpenAgent && (
              <button
                type="button"
                onClick={onOpenAgent}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-orange-950 bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 hover:from-amber-200 hover:to-orange-200 border border-orange-300 rounded-xl transition-all shadow-2xs cursor-pointer group"
                title="AI Agent ผู้ช่วยรับออเดอร์กุ้งเผาเผา 烤烤 แนะนำเมนูและจัดใส่ตะกร้า"
              >
                <Bot className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform" />
                <span className="whitespace-nowrap">Agent รับออเดอร์</span>
                <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.2 rounded-full font-black animate-pulse">
                  AI
                </span>
              </button>
            )}

            {/* Merchant Portal / Registration Button */}
            {merchant ? (
              <button
                type="button"
                onClick={onOpenMerchantDashboard}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                title="เข้าระบบจัดการร้านค้า & สินค้า"
              >
                <Store className="w-4 h-4 text-orange-700" />
                <span className="truncate max-w-[130px]">{merchant.shopName}</span>
                <span className="w-2 h-2 rounded-full bg-orange-500" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenMerchantRegistration}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-all cursor-pointer"
                title="สมัครสมาชิกร้านค้า FlowFood Merchant"
              >
                <Store className="w-4 h-4 text-orange-600" />
                <span>สมัครร้านค้า</span>
              </button>
            )}

            {onOpenLineNotifications && (
              <button
                onClick={onOpenLineNotifications}
                className="relative flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#06C755] hover:bg-orange-50 border border-[#06C755]/30 rounded-xl transition-colors cursor-pointer"
                title="ระบบแจ้งเตือนผ่าน LINE"
              >
                <MessageCircle className="w-4 h-4 fill-[#06C755]" />
                <span className="hidden md:inline">แจ้งเตือน</span>
                {unreadNotificationsCount > 0 && (
                  <span className="bg-[#06C755] text-white text-[10px] font-extrabold rounded-full px-1.5 py-0.2">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-orange-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">ประวัติ</span>
            </button>

            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-xs transition-transform active:scale-95 font-semibold text-xs min-h-[40px] cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 text-[10px] font-extrabold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span>ตะกร้า</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
