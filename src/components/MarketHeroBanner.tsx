import { useState } from 'react';
import { 
  Star, 
  Clock, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Check, 
  Tag, 
  Flame, 
  ShieldCheck,
  ChevronRight,
  Info,
  Power,
  Store,
  Phone,
  AlertTriangle
} from 'lucide-react';
import { MARKET_INFO, PROMO_COUPONS } from '../data/seafoodData';
import { PromoCoupon, MerchantProfile } from '../types';

interface MarketHeroBannerProps {
  onApplyCoupon: (coupon: PromoCoupon) => void;
  appliedCouponCode?: string;
  merchant?: MerchantProfile | null;
  onToggleShopOpen?: () => void;
}

export function MarketHeroBanner({ 
  onApplyCoupon, 
  appliedCouponCode,
  merchant,
  onToggleShopOpen,
}: MarketHeroBannerProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const isStoreOpen = merchant ? merchant.isOpen : true;
  const currentShopName = merchant?.shopName || MARKET_INFO.name;
  const currentPhone = merchant?.phone || MARKET_INFO.phone;
  const currentAddress = merchant?.address || MARKET_INFO.address;

  const handleCopyAndApply = (coupon: PromoCoupon) => {
    onApplyCoupon(coupon);
    setCopiedCode(coupon.code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden mb-6">
      {/* Store Closed Announcement Banner if store is closed */}
      {!isStoreOpen && (
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 text-white px-4 sm:px-6 py-3 border-b border-rose-800 shadow-inner flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl shrink-0 mt-0.5 sm:mt-0">
              <Power className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base">
                  ขณะนี้ร้าน {currentShopName} พักรับออเดอร์ชั่วคราว
                </span>
                <span className="bg-white text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Closed
                </span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5">
                พักเตาถ่าน / เตรียมกุ้งสดรอบใหม่ สามารถเลือกชมเมนูหรือจัดเตรียมสินค้าไว้ในตะกร้าล่วงหน้าได้ครับ โทร: {currentPhone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {onToggleShopOpen && (
              <button
                type="button"
                onClick={onToggleShopOpen}
                className="px-3.5 py-1.5 bg-white text-rose-800 hover:bg-rose-50 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="สำหรับเจ้าของร้านค้า: สลับสถานะเปิดร้านเพื่อเริ่มรับออเดอร์"
              >
                <Power className="w-3.5 h-3.5 text-rose-700" />
                <span>เปิดร้านรับออเดอร์</span>
              </button>
            )}
            <a
              href={`tel:${currentPhone.split(',')[0].trim()}`}
              className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>โทรสอบถาม</span>
            </a>
          </div>
        </div>
      )}

      {/* Cover Banner */}
      <div className="relative h-44 sm:h-56 w-full bg-slate-900 overflow-hidden">
        <img
          src={MARKET_INFO.bannerUrl}
          alt={currentShopName}
          className="w-full h-full object-cover opacity-85 brightness-95 transform hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
        
        {/* Freshness Tag on Image */}
        <div className="absolute top-3 left-3 bg-orange-500/90 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>กุ้งเผาเผา 烤烤 การันตีหัวมันแก้ว 100% ย่างเตาถ่านโรยดอกเกลือ</span>
        </div>

        {/* Store Open / Closed Status Badge on Banner */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {isStoreOpen ? (
            <div className="bg-emerald-600/95 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
              <span>🟢 ร้านเปิดรับออเดอร์ปกติ</span>
            </div>
          ) : (
            <div className="bg-rose-600/95 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              <span className="h-2 w-2 rounded-full bg-white"></span>
              <span>🔴 ร้านปิดรับออเดอร์ชั่วคราว</span>
            </div>
          )}
        </div>

        {/* Bottom floating details on banner */}
        <div className="absolute bottom-3 left-3 sm:left-6 right-3 text-white flex items-end gap-3.5">
          <img
            src={merchant?.avatarUrl || MARKET_INFO.logoUrl}
            alt="Kao Kao Logo"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-white/90 shadow-lg object-cover shrink-0 bg-white"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2 drop-shadow-xs">
                <span className="truncate">{currentShopName}</span>
                <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0" />
              </h1>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                isStoreOpen ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
              }`}>
                {isStoreOpen ? 'เปิดร้าน' : 'ปิดร้านชั่วคราว'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 mt-0.5 line-clamp-1 drop-shadow-xs">
              {merchant?.category || 'กุ้งเผาหัวมันแก้วกู๊กกกตัว ย่างด้วยดอกเกลือแท้ กุ้งขาวลวกจิ้มเนื้อหวาน พร้อมน้ำจิ้มสุดแซ่บซีสสสส มะนาวแท้'}
            </p>
            <p className="text-[11px] text-amber-200 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
              <span className="truncate">{currentAddress} • โทร: {currentPhone}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Info Stats Bar */}
      <div className="px-4 sm:px-6 py-3 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-y-2 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Status Chip */}
          <div className="flex items-center gap-1.5 font-bold">
            <span className={`w-2 h-2 rounded-full ${isStoreOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className={isStoreOpen ? 'text-emerald-800' : 'text-rose-800'}>
              {isStoreOpen ? 'เตาถ่านพร้อมเผา • รับออเดอร์สดใหม่' : 'ร้านปิดชั่วคราว • พักเตาถ่าน'}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 font-semibold text-slate-800">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold">{MARKET_INFO.rating}</span>
            <span className="text-slate-400 font-normal">({MARKET_INFO.reviews})</span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <Clock className="w-3.5 h-3.5 text-orange-600" />
            <span>จัดส่งด่วน {MARKET_INFO.estimatedTimeMin}</span>
          </div>

          {/* Distance */}
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>ระยะทาง {MARKET_INFO.distanceKm} กม.</span>
          </div>

          {/* Base Fee */}
          <div className="bg-orange-50 text-orange-700 font-semibold px-2 py-0.5 rounded-md border border-orange-100">
            ค่าส่งเริ่มต้น ฿{MARKET_INFO.baseDeliveryFee}
          </div>
        </div>

        {/* Assurance badges */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
            น้ำจิ้มมะนาวแท้ 100%
          </span>
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            ย่างเตาถ่านร้อนทุกออเดอร์
          </span>
        </div>
      </div>

      {/* Announcement Strip */}
      <div className="px-4 sm:px-6 py-2 bg-amber-50/60 border-b border-amber-100/60 flex items-center gap-2 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="truncate">{MARKET_INFO.announcement}</span>
      </div>

      {/* Promo Voucher Strip */}
      <div className="px-4 sm:px-6 py-3 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-orange-600" />
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              คูปองส่วนลดพิเศษ (กดใช้ได้ทันที)
            </span>
          </div>
          <span className="text-[11px] text-slate-400">กดเพื่อใช้โค้ดลดค่าอาหาร & ค่าส่ง</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {PROMO_COUPONS.map((coupon) => {
            const isApplied = appliedCouponCode === coupon.code;
            return (
              <div
                key={coupon.code}
                onClick={() => handleCopyAndApply(coupon)}
                className={`group cursor-pointer rounded-xl border p-2.5 transition-all flex items-center justify-between gap-2 relative overflow-hidden ${
                  isApplied
                    ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                    : 'border-dashed border-slate-200 hover:border-orange-400 hover:bg-slate-50'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded tracking-wide">
                      {coupon.code}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      {coupon.badge}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-1 truncate">
                    {coupon.title}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {coupon.description}
                  </p>
                </div>

                <button
                  type="button"
                  className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                    isApplied
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-100 text-slate-700 group-hover:bg-orange-500 group-hover:text-white'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>ใช้แล้ว</span>
                    </>
                  ) : copiedCode === coupon.code ? (
                    <>
                      <Check className="w-3 h-3 text-orange-600" />
                      <span>คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>ใช้โค้ด</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
