import { useState, useId } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  MapPin, 
  Ticket, 
  Check, 
  Bike, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Wallet, 
  UtensilsCrossed, 
  ChevronRight,
  AlertCircle,
  Edit3
} from 'lucide-react';
import { CartItem, PromoCoupon } from '../types';
import { PROMO_COUPONS, MARKET_INFO } from '../data/seafoodData';
import { calculateDeliveryFee, estimateDeliveryMinutes } from '../utils/locationUtils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  deliveryAddress: string;
  distanceKm?: number;
  onOpenAddressModal: () => void;
  onUpdateDeliveryAddress?: (newAddress: string) => void;
  appliedCoupon: PromoCoupon | null;
  onApplyCoupon: (coupon: PromoCoupon | null) => void;
  onCheckout: (
    paymentMethod: 'promptpay' | 'linepay' | 'credit' | 'cod',
    deliveryNotes: string,
    cutlery: boolean
  ) => void;
  isStoreOpen?: boolean;
}

export function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  deliveryAddress,
  distanceKm = 0.3,
  onOpenAddressModal,
  onUpdateDeliveryAddress,
  appliedCoupon,
  onApplyCoupon,
  onCheckout,
  isStoreOpen = true,
}: CartDrawerProps) {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [cutlery, setCutlery] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'linepay' | 'credit' | 'cod'>('promptpay');
  const [isEditingAddressInline, setIsEditingAddressInline] = useState(false);
  const [inlineAddressInput, setInlineAddressInput] = useState(deliveryAddress);

  const couponInputId = useId();
  const deliveryNotesId = useId();

  if (!isOpen) return null;

  // Pricing calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.itemTotal, 0);
  const rawDeliveryFee = calculateDeliveryFee(distanceKm);
  
  // Calculate discount
  let discount = 0;
  if (appliedCoupon) {
    if (subtotal >= appliedCoupon.minSpend) {
      discount = appliedCoupon.discountAmount;
    }
  }

  // Delivery fee discount if FREESHIP
  const deliveryFee = appliedCoupon?.code === 'FREESHIP' ? 0 : rawDeliveryFee;
  const grandTotal = Math.max(0, subtotal + deliveryFee - (appliedCoupon?.code === 'FREESHIP' ? 0 : discount));

  const handleApplyCouponCode = () => {
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    const found = PROMO_COUPONS.find((c) => c.code.toUpperCase() === code);
    if (!found) {
      setCouponError('ไม่พบคูปองนี้ กรุณาตรวจสอบรหัสอีกครั้ง');
      return;
    }

    if (subtotal < found.minSpend) {
      setCouponError(`คูปองนี้ต้องมียอดสั่งซื้อขั้นต่ำ ฿${found.minSpend}`);
      return;
    }

    onApplyCoupon(found);
    setCouponInput('');
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;
    onCheckout(paymentMethod, deliveryNotes, cutlery);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center font-bold">
              🛒
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-slate-900 leading-tight">
                ตะกร้าอาหารทะเล
              </h2>
              <p className="text-xs text-slate-500">
                {cartItems.length} รายการ จาก {MARKET_INFO.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-xs text-rose-500 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
              >
                ล้างตะกร้า
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center text-4xl mb-4">
              🦐
            </div>
            <h3 className="text-base font-bold text-slate-800">ยังไม่มีอาหารทะเลในตะกร้า</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              เลือกเมนูกุ้งแม่น้ำเผา ปูม้านึ่ง หอยนางรมสด และเมนูอร่อยอื่นๆ ลงตะกร้าได้เลย
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              ดูรายการอาหารทะเล
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {/* Delivery Destination Card */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <span>ที่อยู่จัดส่งของคุณ</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {!isEditingAddressInline && (
                    <button
                      type="button"
                      onClick={() => {
                        setInlineAddressInput(deliveryAddress);
                        setIsEditingAddressInline(true);
                      }}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded-lg border border-orange-200 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>พิมพ์แก้ไข</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onOpenAddressModal}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                  >
                    เลือกจุดส่ง &gt;
                  </button>
                </div>
              </div>

              {isEditingAddressInline ? (
                <div className="space-y-2 mt-2 pt-2 border-t border-slate-200">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    แก้ไขข้อความที่อยู่จัดส่ง (เช่น บ้านเลขที่/ซอย):
                  </label>
                  <textarea
                    rows={2}
                    value={inlineAddressInput}
                    onChange={(e) => setInlineAddressInput(e.target.value)}
                    placeholder="พิมพ์ที่อยู่จัดส่งของคุณ..."
                    className="w-full text-xs p-2.5 bg-white border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none leading-relaxed"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingAddressInline(false)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = inlineAddressInput.trim();
                        if (trimmed && onUpdateDeliveryAddress) {
                          onUpdateDeliveryAddress(trimmed);
                        }
                        setIsEditingAddressInline(false);
                      }}
                      className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>บันทึกที่อยู่นี้</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  {deliveryAddress}
                </p>
              )}

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Bike className="w-3.5 h-3.5 text-orange-500" />
                  ระยะทาง {distanceKm} กม. จากร้าน
                </span>
                <span>เวลาส่งประมาณ {estimateDeliveryMinutes(distanceKm)}</span>
              </div>
            </div>

            {/* Cart Items List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  รายการอาหารทะเลที่เลือก
                </span>
                <span className="text-xs text-slate-400">{cartItems.length} รายการ</span>
              </div>

              <div className="space-y-3">
                {cartItems.map((cItem) => (
                  <div
                    key={cItem.cartItemId}
                    className="p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs flex gap-3"
                  >
                    <img
                      src={cItem.item.imageUrl}
                      alt={cItem.item.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                          {cItem.item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(cItem.cartItemId)}
                          className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Chosen Options Pills */}
                      <div className="mt-1 space-y-0.5 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1">
                          <span className="text-orange-700 font-semibold">• ขนาด:</span>
                          <span className="truncate">{cItem.options.weight.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-orange-700 font-semibold">• ปรุง:</span>
                          <span className="truncate">{cItem.options.cooking.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-orange-700 font-semibold">• น้ำจิ้ม:</span>
                          <span className="truncate">{cItem.options.sauce.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-amber-700">
                          <span>• เผ็ด: {cItem.options.spiciness}</span>
                        </div>
                        {cItem.options.selectedAddOns.length > 0 && (
                          <div className="text-[10px] text-slate-500">
                            + {cItem.options.selectedAddOns.map((a) => a.name).join(', ')}
                          </div>
                        )}
                        {cItem.options.specialInstructions && (
                          <div className="text-[10px] text-slate-500 italic bg-slate-50 px-1.5 py-0.5 rounded">
                            "{cItem.options.specialInstructions}"
                          </div>
                        )}
                      </div>

                      {/* Quantity & Item Subtotal */}
                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-50">
                        <span className="text-xs font-black text-slate-900">
                          ฿{cItem.itemTotal.toLocaleString()}
                        </span>

                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(cItem.cartItemId, cItem.quantity - 1)}
                            className="p-1 px-2 text-slate-600 hover:bg-slate-200 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-slate-900">
                            {cItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(cItem.cartItemId, cItem.quantity + 1)}
                            className="p-1 px-2 text-slate-600 hover:bg-slate-200 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note to Rider & Cutlery */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
              <div>
                <label htmlFor={deliveryNotesId} className="block text-xs font-bold text-slate-800 mb-1">
                  หมายเหตุถึงไรเดอร์จัดส่ง
                </label>
                <input
                  id={deliveryNotesId}
                  type="text"
                  placeholder="เช่น ฝากไว้ที่ป้อมยาม, ขึ้นลิฟต์มาชั้น 8, โทรเมื่อถึง..."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
                />
              </div>

              {/* Cutlery toggle */}
              <div 
                onClick={() => setCutlery(!cutlery)}
                className="flex items-center justify-between cursor-pointer pt-1"
              >
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-orange-600" />
                  <div>
                    <div className="text-xs font-semibold text-slate-800">
                      รับช้อนส้อม / ตะเกียบพลาสติก
                    </div>
                    <div className="text-[10px] text-slate-500">
                      ร้านเตรียมถุงมือแกะกุ้งและทิชชู่เปียกให้ฟรี
                    </div>
                  </div>
                </div>
                <div
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                    cutlery ? 'bg-orange-500' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      cutlery ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Promo Voucher Section */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
              <label htmlFor={couponInputId} className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                <span className="flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-orange-600" />
                  <span>โค้ดส่วนลดพิเศษ</span>
                </span>
                {appliedCoupon && (
                  <button
                    type="button"
                    onClick={() => onApplyCoupon(null)}
                    className="text-[11px] text-rose-500 hover:underline font-semibold"
                  >
                    ยกเลิกโค้ด
                  </button>
                )}
              </label>

              {appliedCoupon ? (
                <div className="bg-orange-100/70 border border-orange-300 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-orange-900">
                      ✓ ใช้โค้ด: {appliedCoupon.code}
                    </span>
                    <p className="text-[11px] text-orange-800">{appliedCoupon.description}</p>
                  </div>
                  <span className="font-bold text-orange-800 text-sm">
                    -฿{appliedCoupon.code === 'FREESHIP' ? 35 : appliedCoupon.discountAmount}
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      id={couponInputId}
                      type="text"
                      placeholder="ใส่โค้ด เช่น KAOKAO50, FREESHIP"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError(null);
                      }}
                      className="flex-1 text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 focus:border-orange-500 uppercase font-semibold outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCouponCode}
                      className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      ใช้โค้ด
                    </button>
                  </div>

                  {couponError && (
                    <div className="flex items-center gap-1 text-[11px] text-rose-500 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{couponError}</span>
                    </div>
                  )}

                  {/* Quick Code Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {PROMO_COUPONS.map((cp) => (
                      <button
                        key={cp.code}
                        type="button"
                        onClick={() => {
                          if (subtotal >= cp.minSpend) {
                            onApplyCoupon(cp);
                          } else {
                            setCouponError(`โค้ด ${cp.code} ต้องมียอดขั้นต่ำ ฿${cp.minSpend}`);
                          }
                        }}
                        className="text-[10px] font-bold bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-slate-700 px-2 py-1 rounded-lg transition-colors"
                      >
                        + {cp.code} ({cp.title})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 block">
                เลือกวิธีชำระเงิน
              </span>

              <div className="grid grid-cols-2 gap-2">
                {/* PromptPay */}
                <div
                  onClick={() => setPaymentMethod('promptpay')}
                  className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                    paymentMethod === 'promptpay'
                      ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 leading-tight">พร้อมเพย์ QR</div>
                    <div className="text-[10px] text-slate-500">สแกนจ่ายทันที</div>
                  </div>
                </div>

                {/* LINE Pay */}
                <div
                  onClick={() => setPaymentMethod('linepay')}
                  className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                    paymentMethod === 'linepay'
                      ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-orange-100 text-orange-800">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 leading-tight">LINE Pay</div>
                    <div className="text-[10px] text-slate-500">Rabbit LINE Pay</div>
                  </div>
                </div>

                {/* Credit Card */}
                <div
                  onClick={() => setPaymentMethod('credit')}
                  className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                    paymentMethod === 'credit'
                      ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-800">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 leading-tight">บัตรเครดิต</div>
                    <div className="text-[10px] text-slate-500">Visa / Mastercard</div>
                  </div>
                </div>

                {/* Cash on delivery */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 leading-tight">เก็บเงินปลายทาง</div>
                    <div className="text-[10px] text-slate-500">จ่ายเงินสดกับไรเดอร์</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="text-xs font-bold text-slate-800 mb-2">สรุปค่าใช้จ่าย</div>

              <div className="flex justify-between text-slate-600">
                <span>รวมค่าอาหาร ({cartItems.reduce((a, b) => a + b.quantity, 0)} ชิ้น)</span>
                <span>฿{subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>ค่าจัดส่งอาหาร ({distanceKm} กม. จากร้านกุ้งเผาเผา)</span>
                <span>{deliveryFee === 0 ? <span className="text-orange-600 font-bold">ฟรีค่าส่ง</span> : `฿${deliveryFee}`}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-orange-600 font-bold">
                  <span>ส่วนลดโปรโมชั่น ({appliedCoupon?.code})</span>
                  <span>-฿{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-extrabold text-sm text-slate-900">ยอดชำระสุทธิ</span>
                <span className="font-black text-xl text-orange-600">
                  ฿{grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Checkout Button */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-white border-t border-slate-100 shrink-0 shadow-lg space-y-2">
            {!isStoreOpen && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>ขณะนี้ร้านค้าปิดรับออเดอร์ชั่วคราว จึงยังไม่สามารถส่งคำสั่งซื้อได้ครับ</span>
              </div>
            )}

            <button
              type="button"
              disabled={!isStoreOpen}
              onClick={handlePlaceOrder}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-between shadow-lg transition-all ${
                !isStoreOpen
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white shadow-orange-500/20 cursor-pointer'
              }`}
            >
              <div className="text-left">
                <div className="text-xs text-slate-100 font-normal">
                  {!isStoreOpen ? 'ร้านปิดรับออเดอร์ชั่วคราว' : 'ยืนยันและสั่งซื้อ'}
                </div>
                <div className="text-sm font-extrabold">
                  {!isStoreOpen ? 'ไม่สามารถสั่งซื้อได้ขณะร้านปิด' : (
                    paymentMethod === 'promptpay' ? 'จ่ายผ่าน พร้อมเพย์ QR' :
                    paymentMethod === 'linepay' ? 'จ่ายผ่าน LINE Pay' :
                    paymentMethod === 'credit' ? 'จ่ายด้วย บัตรเครดิต' : 'เก็บเงินสดปลายทาง'
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-base font-black bg-white/10 px-3 py-1.5 rounded-xl">
                <span>฿{grandTotal.toLocaleString()}</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
