import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Bike, 
  ChefHat, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Store, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  Sparkles,
  Share2,
  Navigation,
  MessageCircle,
  PhoneCall
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { MARKET_INFO } from '../data/seafoodData';

interface LiveTrackingViewProps {
  order: Order;
  onBackToHome: () => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onOpenRiderChat: () => void;
  onOpenCall?: (target: 'rider' | 'restaurant') => void;
  onOpenLineNotifications?: () => void;
  onUpdateOrderAddress?: (orderId: string, newAddress: string) => void;
}

export function LiveTrackingView({
  order,
  onBackToHome,
  onUpdateOrderStatus,
  onOpenRiderChat,
  onOpenCall,
  onOpenLineNotifications,
  onUpdateOrderAddress,
}: LiveTrackingViewProps) {
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editedAddressInput, setEditedAddressInput] = useState(order.deliveryAddress.addressText);

  // Status mapping
  const statuses: { key: OrderStatus; label: string; sub: string; icon: any }[] = [
    { key: 'confirmed', label: 'ร้านรับออเดอร์แล้ว', sub: 'ตรวจสอบความสดของอาหารทะเล', icon: Store },
    { key: 'cooking', label: 'เชฟกำลังปรุงสด', sub: 'เผาเตาถ่าน / นึ่งสมุนไพรสดใหม่', icon: ChefHat },
    { key: 'picking_up', label: 'ไรเดอร์ไปรับอาหาร', sub: 'พี่สมชาย ถึงร้านแล้ว กำลังรับกล่องโฟม', icon: Bike },
    { key: 'delivering', label: 'กำลังนำส่งถึงคุณ', sub: 'ไรเดอร์กำลังขับขี่อย่างปลอดภัย', icon: Navigation },
    { key: 'delivered', label: 'จัดส่งสำเร็จ', sub: 'ทานอาหารทะเลให้อร่อยนะครับ!', icon: CheckCircle2 },
  ];

  const currentStatusIndex = statuses.findIndex((s) => s.key === order.status);

  // Auto-progress simulation effect so the user sees a realistic live delivery flow
  useEffect(() => {
    if (order.status === 'delivered') return;

    const timer = setTimeout(() => {
      if (order.status === 'confirmed') {
        onUpdateOrderStatus(order.id, 'cooking');
      } else if (order.status === 'cooking') {
        onUpdateOrderStatus(order.id, 'picking_up');
      } else if (order.status === 'picking_up') {
        onUpdateOrderStatus(order.id, 'delivering');
      } else if (order.status === 'delivering') {
        onUpdateOrderStatus(order.id, 'delivered');
      }
    }, 18000); // 18 seconds per step auto simulation

    return () => clearTimeout(timer);
  }, [order.id, order.status, onUpdateOrderStatus]);

  return (
    <div className="min-h-screen bg-[#F6F7F9] pb-24 sm:pb-12 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-2xs px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้ารายการอาหาร</span>
          </button>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">หมายเลขออเดอร์</span>
            <span className="text-xs font-bold text-slate-800">#{order.orderNumber}</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-4 space-y-4">
        {/* Status Card Hero */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-orange-100 text-orange-900 mb-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span>
                  {order.status === 'confirmed' ? 'รับออเดอร์แล้ว' :
                   order.status === 'cooking' ? 'กำลังปรุงอาหารทะเล' :
                   order.status === 'picking_up' ? 'ไรเดอร์กำลังไปรับ' :
                   order.status === 'delivering' ? 'ไรเดอร์กำลังมาส่ง' : 'จัดส่งเรียบร้อยแล้ว'}
                </span>
              </span>

              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                {order.status === 'delivered' ? 'ส่งมอบอาหารทะเลเรียบร้อยแล้ว' : 'อาหารทะเลของคุณกำลังเดินทางมา'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {statuses[currentStatusIndex]?.sub}
              </p>
            </div>

            {order.status !== 'delivered' && (
              <div className="text-center bg-orange-50 border border-orange-100 rounded-2xl p-2.5 px-3 shrink-0">
                <span className="text-[10px] text-orange-700 font-bold block">ประมาณ</span>
                <span className="text-xl font-black text-orange-700">
                  {order.status === 'confirmed' ? '30-35' :
                   order.status === 'cooking' ? '20-25' :
                   order.status === 'picking_up' ? '15-18' : '8-10'}
                </span>
                <span className="text-[10px] text-orange-700 font-bold block">นาที</span>
              </div>
            )}
          </div>

          {/* Stepper Progress Bar */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-5 gap-1 relative">
              {statuses.map((st, idx) => {
                const isPassed = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;
                const IconComponent = st.icon;

                return (
                  <div key={st.key} className="flex flex-col items-center text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-orange-500 text-white ring-4 ring-orange-100 shadow-md scale-110'
                          : isPassed
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold mt-1.5 leading-tight ${
                        isCurrent
                          ? 'text-orange-700'
                          : isPassed
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Connecting progress line */}
            <div className="relative mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-700"
                style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Live Animated Map Container */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Navigation className="w-4 h-4 text-orange-600" />
              <span>แผนที่จำลองการจัดส่ง (Live GPS Simulation)</span>
            </div>
            <span className="text-[11px] text-orange-700 font-semibold bg-orange-100 px-2 py-0.5 rounded-full">
              {order.status === 'delivered' ? 'ถึงที่หมายแล้ว' : 'สัญญาณ GPS แม่นยำ'}
            </span>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative h-64 sm:h-72 w-full bg-[#E5ECF4] overflow-hidden">
            {/* Background street grid design */}
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="street-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D1DCED" strokeWidth="1" />
                </pattern>
                <linearGradient id="deliveryPathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#EA580C" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="#EAF0F8" />
              <rect width="100%" height="100%" fill="url(#street-grid)" />

              {/* Major Roads */}
              <path d="M 0 80 Q 200 90 400 60 T 800 120" stroke="#FFFFFF" strokeWidth="18" fill="none" />
              <path d="M 120 0 L 140 300" stroke="#FFFFFF" strokeWidth="14" fill="none" />
              <path d="M 320 0 L 290 300" stroke="#FFFFFF" strokeWidth="16" fill="none" />
              <path d="M 0 210 Q 220 180 500 230" stroke="#FFFFFF" strokeWidth="16" fill="none" />

              {/* Green Park Areas */}
              <rect x="30" y="100" width="70" height="80" rx="8" fill="#CBE5D3" opacity="0.8" />
              <rect x="360" y="130" width="80" height="70" rx="8" fill="#CBE5D3" opacity="0.8" />

              {/* Delivery Path from Restaurant to User */}
              <path
                d="M 80 180 Q 180 110 240 140 T 400 80"
                stroke="#F97316"
                strokeWidth="5"
                strokeDasharray="6 4"
                fill="none"
              />
            </svg>

            {/* Restaurant Pin (Left side) */}
            <div className="absolute left-[70px] top-[165px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md mb-1 whitespace-nowrap">
                🦐 ครัวกุ้งเผาเผา 烤烤 (พฤกษาวิลเลจ 1 ลำลูกกา)
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white shadow-lg flex items-center justify-center text-white">
                <Store className="w-4 h-4" />
              </div>
            </div>

            {/* Destination Pin (User home, Right side) */}
            <div className="absolute left-[400px] top-[70px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md mb-1 whitespace-nowrap">
                🏠 จุดส่งคุณ
              </div>
              <div className="w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-lg flex items-center justify-center text-white animate-bounce">
                <MapPin className="w-4 h-4" />
              </div>
            </div>

            {/* Moving Rider Motorbike Pin */}
            {order.status !== 'delivered' && (
              <div
                className="absolute transition-all duration-1000 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                style={{
                  left:
                    order.status === 'confirmed' ? '85px' :
                    order.status === 'cooking' ? '120px' :
                    order.status === 'picking_up' ? '180px' : '290px',
                  top:
                    order.status === 'confirmed' ? '175px' :
                    order.status === 'cooking' ? '155px' :
                    order.status === 'picking_up' ? '135px' : '105px',
                }}
              >
                <div className="bg-orange-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md mb-1 whitespace-nowrap flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>พี่สมชาย (Kǎo Kǎo Rider)</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-orange-500 border-3 border-white shadow-xl flex items-center justify-center text-white">
                  <Bike className="w-5 h-5 text-white" />
                </div>
              </div>
            )}

            {/* If delivered, show delivery completed banner */}
            {order.status === 'delivered' && (
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-4 text-center max-w-xs shadow-xl animate-in zoom-in-95">
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2 font-bold text-xl">
                    ✓
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">อาหารถึงมือเรียบร้อยแล้ว</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    ขอบคุณที่สั่งอาหารทะเลสดกับ กุ้งเผาเผา 烤烤 (Kǎo Kǎo) Seafood
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rider Profile Card */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={order.rider.avatarUrl}
                  alt={order.rider.name}
                  className="w-13 h-13 rounded-2xl object-cover border-2 border-orange-500"
                />
                <span className="absolute -bottom-1 -right-1 bg-orange-600 text-white text-[9px] font-black px-1 rounded-sm">
                  Kǎo Kǎo
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-slate-900">{order.rider.name}</h3>
                  <span className="text-xs text-amber-500 font-bold flex items-center">
                    ★ {order.rider.rating}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{order.rider.bikeModel} • ทะเบียน {order.rider.plate}</p>
                <div className="text-[11px] text-orange-700 font-medium">
                  ฉีดวัคซีนแล้ว • กล่องเก็บความร้อน-เย็นพร้อม
                </div>
              </div>
            </div>

            {/* In-App Call & Chat Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => onOpenCall?.('rider')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-xs border border-orange-200 transition-colors cursor-pointer min-h-[40px]"
                title="โทรหาไรเดอร์ผ่านแอปฟรี"
              >
                <PhoneCall className="w-4 h-4 text-orange-600" />
                <span>โทรผ่านแอป</span>
              </button>

              <button
                type="button"
                onClick={onOpenRiderChat}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer min-h-[40px]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>แชท</span>
              </button>
            </div>
          </div>

          {/* Quick contact restaurant link */}
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>มีข้อสงสัยเรื่องอาหารทะเลสด?</span>
            <button
              type="button"
              onClick={() => onOpenCall?.('restaurant')}
              className="text-orange-700 font-bold hover:underline flex items-center gap-1"
            >
              <Store className="w-3.5 h-3.5" />
              <span>โทรสอบถามครัวกุ้งเผาเผา (080-382-4909, 096-328-6005)</span>
            </button>
          </div>
        </div>

        {/* LINE Notification Status Banner inside Tracking */}
        {onOpenLineNotifications && (
          <div 
            onClick={onOpenLineNotifications}
            className="p-3.5 bg-[#E8F8EE] rounded-2xl border border-[#06C755]/30 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#d8f4e2] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#06C755] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                <MessageCircle className="w-4 h-4 fill-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>แจ้งเตือนสถานะผ่าน LINE: เชื่อมต่อแล้ว</span>
                  <span className="w-2 h-2 rounded-full bg-[#06C755] animate-pulse" />
                </div>
                <p className="text-[11px] text-slate-600">
                  ส่งข้อความเตือนเมื่อกุ้งย่างสุก, ไรเดอร์รับของ และเมื่อมาถึงหน้าตึก
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-[#06C755] shrink-0 underline">
              เปิดดู &gt;
            </span>
          </div>
        )}

        {/* Order Details Accordion */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowOrderDetails(!showOrderDetails)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">
                รายละเอียดรายการอาหาร ({order.items.reduce((s, i) => s + i.quantity, 0)} รายการ)
              </span>
              <span className="text-xs font-bold text-orange-600">
                ฿{order.total.toLocaleString()}
              </span>
            </div>
            {showOrderDetails ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showOrderDetails && (
            <div className="p-4 pt-0 border-t border-slate-100 space-y-3 text-xs">
              <div className="space-y-2.5 pt-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-2 pb-2 border-b border-slate-50">
                    <div>
                      <div className="font-bold text-slate-800">
                        {item.quantity}x {item.item.name}
                      </div>
                      <div className="text-[11px] text-slate-500 space-y-0.5 mt-0.5">
                        <div>• ขนาด: {item.options.weight.name}</div>
                        <div>• ปรุง: {item.options.cooking.name}</div>
                        <div>• น้ำจิ้ม: {item.options.sauce.name}</div>
                        <div>• ระดับเผ็ด: {item.options.spiciness}</div>
                        {item.options.specialInstructions && (
                          <div className="italic text-orange-700">"{item.options.specialInstructions}"</div>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-slate-800">
                      ฿{item.itemTotal.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="pt-2 space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>ค่าอาหาร:</span>
                  <span>฿{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>ค่าจัดส่ง:</span>
                  <span>{order.deliveryFee === 0 ? 'ฟรี' : `฿${order.deliveryFee}`}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-orange-600 font-bold">
                    <span>ส่วนลด:</span>
                    <span>-฿{order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-slate-900 text-sm pt-2 border-t border-slate-100">
                  <span>ยอดสุทธิ ({order.paymentMethod.toUpperCase()}):</span>
                  <span className="text-orange-600">฿{order.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery destination notes */}
              <div className="mt-3 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-2 border border-slate-200/80">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <strong>ส่งที่:</strong> {order.deliveryAddress.addressText}
                  </div>
                  {['confirmed', 'cooking'].includes(order.status) && !isEditingAddress && onUpdateOrderAddress && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditedAddressInput(order.deliveryAddress.addressText);
                        setIsEditingAddress(true);
                      }}
                      className="px-2 py-0.5 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold rounded text-[10px] shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>✏️ แก้ไขที่อยู่</span>
                    </button>
                  )}
                </div>

                {isEditingAddress && (
                  <div className="p-2.5 bg-white border border-orange-300 rounded-lg space-y-2 mt-1">
                    <label className="text-[10px] font-bold text-slate-700 block">
                      แก้ไขที่อยู่จัดส่งสำหรับออเดอร์นี้ (แจ้งไรเดอร์ทันที):
                    </label>
                    <textarea
                      rows={2}
                      value={editedAddressInput}
                      onChange={(e) => setEditedAddressInput(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-orange-500"
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(false)}
                        className="px-2 py-1 text-[10px] text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = editedAddressInput.trim();
                          if (trimmed && onUpdateOrderAddress) {
                            onUpdateOrderAddress(order.id, trimmed);
                          }
                          setIsEditingAddress(false);
                        }}
                        className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded text-[10px] cursor-pointer"
                      >
                        บันทึกการแก้ไข
                      </button>
                    </div>
                  </div>
                )}

                {order.riderNote && <div><strong>โน้ตถึงไรเดอร์:</strong> {order.riderNote}</div>}
                <div><strong>ช้อนส้อม:</strong> {order.cutlery ? 'รับช้อนส้อมพลาสติก' : 'ไม่รับช้อนส้อม'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Demo Fast-forward status simulation bar */}
        <div className="bg-slate-100/80 rounded-2xl p-3 border border-slate-200 text-center">
          <div className="text-[11px] text-slate-500 font-medium mb-2">
            ⚙️ จำลองเปลี่ยนสถานะเดลิเวอรี (สำหรับทดสอบขั้นตอน):
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {statuses.map((st) => (
              <button
                key={st.key}
                type="button"
                onClick={() => onUpdateOrderStatus(order.id, st.key)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  order.status === st.key
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
