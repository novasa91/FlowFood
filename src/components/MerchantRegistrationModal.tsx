import { useState } from 'react';
import { 
  X, 
  Store, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  Fish, 
  Camera, 
  ArrowRight,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { MerchantProfile } from '../types';

interface MerchantRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (merchant: MerchantProfile) => void;
}

const PRESET_SHOPS = [
  {
    shopName: 'กุ้งเผาเผา 烤烤 (Kǎo Kǎo) สาขา 1',
    ownerName: 'เชฟเก้า (Kǎo Kǎo Grill Master)',
    phone: '089-998-7654',
    category: 'กุ้งเผาหัวมันแก้ว 100% & อาหารทะเลเผาเตาถ่าน',
    address: 'เตาถ่านพรีเมียม ถนนพระราม 9 ซอย 13 เขตห้วยขวาง กรุงเทพมหานคร',
    promptPayNumber: '0899987654',
    avatarUrl: '/images/products/kaokao-logo.jpg',
    description: 'กุ้งเผาเผาหัวมันแก้วทุกตัว เผาเตาถ่านสดใหม่ มันเยิ้มทะลัก',
  },
  {
    shopName: 'สุราษฎร์ ปูม้านึ่งแกะเนื้อก้อน',
    ownerName: 'วิภาดา มงคลกิจ (เจ๊เปิ้ล)',
    phone: '089-456-7890',
    category: 'ปูม้า & หอยนางรมสุราษฎร์',
    address: 'แพปูกานดา ตลาดประมงดอนสัก จ.สุราษฎร์ธานี',
    promptPayNumber: '0894567890',
    avatarUrl: '/images/products/dish-curry-crab-6.jpg',
    description: 'ปูม้าเนื้อก้อนแน่น กรรเชียงปู หอยนางรมสดส่งตรงวันต่อวัน',
  },
];

export function MerchantRegistrationModal({
  isOpen,
  onClose,
  onRegisterSuccess,
}: MerchantRegistrationModalProps) {
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('อาหารทะเลสด & ปรุงสุก');
  const [address, setAddress] = useState('');
  const [promptPayNumber, setPromptPayNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('/images/products/kaokao-logo.jpg');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESET_SHOPS[0]) => {
    setShopName(preset.shopName);
    setOwnerName(preset.ownerName);
    setPhone(preset.phone);
    setCategory(preset.category);
    setAddress(preset.address);
    setPromptPayNumber(preset.promptPayNumber);
    setAvatarUrl(preset.avatarUrl);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) {
      setErrorMsg('กรุณาระบุชื่อร้านค้าของคุณ');
      return;
    }
    if (!ownerName.trim()) {
      setErrorMsg('กรุณาระบุชื่อเจ้าของร้านค้า');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('กรุณาระบุเบอร์โทรศัพท์ติดต่อ');
      return;
    }

    const newMerchant: MerchantProfile = {
      id: `merchant-${Date.now()}`,
      shopName: shopName.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      category: category.trim(),
      address: address.trim() || 'ตลาดกลางอาหารทะเลสด FlowFood Express',
      promptPayNumber: promptPayNumber.trim() || phone.trim(),
      isOpen: true,
      avatarUrl: avatarUrl || '/images/products/kaokao-logo.jpg',
      rating: 5.0,
      totalSales: 0,
      registeredAt: new Date().toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };

    onRegisterSuccess(newMerchant);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 sm:p-6 shrink-0 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2.5 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FlowFood Merchant Partner</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            สมัครสมาชิกร้านค้า FlowFood
          </h2>
          <p className="text-xs sm:text-sm text-emerald-50 mt-1">
            เปิดร้านขายอาหารทะเลออนไลน์ จัดการเมนู สต็อกความสด และรับออเดอร์ทันที ไม่มีค่าแรกเข้า
          </p>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Quick Preset Selection */}
          <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-100/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>ตัวอย่างร้านค้าแนะนำ (คลิกเพื่อกรอกอัตโนมัติ)</span>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_SHOPS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="text-left p-2.5 bg-white rounded-xl border border-emerald-200/80 hover:border-emerald-500 hover:shadow-xs transition-all flex items-center gap-2.5 cursor-pointer group"
                >
                  <img
                    src={preset.avatarUrl}
                    alt={preset.shopName}
                    className="w-10 h-10 rounded-lg object-cover shrink-0 ring-1 ring-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-700">
                      {preset.shopName}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{preset.ownerName}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <X className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} id="merchant-reg-form" className="space-y-4">
            {/* Shop Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ชื่อร้านค้า / แบรนด์แพปลา <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="เช่น แพปลาสมุทร ซีฟู้ดสด, ครัวทะเลทอง"
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                />
              </div>
            </div>

            {/* Owner Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ชื่อเจ้าของร้าน / ผู้ดูแล <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="เช่น คุณวิชัย หรือ ลุงหมึก"
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  เบอร์โทรศัพท์ร้านค้า <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="เช่น 089-123-4567"
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Category & PromptPay */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  หมวดหมู่หลัก
                </label>
                <div className="relative">
                  <Fish className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="อาหารทะเลสด & ปรุงสุก">อาหารทะเลสด & ปรุงสุก</option>
                    <option value="กุ้งแม่น้ำ & กุ้งลายเสือเผา">กุ้งแม่น้ำ & กุ้งลายเสือเผา</option>
                    <option value="ปูม้าสุราษฎร์ & ปูไข่ดอง">ปูม้าสุราษฎร์ & ปูไข่ดอง</option>
                    <option value="ปลากะพงทอดน้ำปลา & ซาชิมิ">ปลากะพงทอดน้ำปลา & ซาชิมิ</option>
                    <option value="หอยนางรมสด & ซีฟู้ดปาร์ตี้">หอยนางรมสด & ซีฟู้ดปาร์ตี้</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  เบอร์พร้อมเพย์รับเงิน (PromptPay)
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={promptPayNumber}
                    onChange={(e) => setPromptPayNumber(e.target.value)}
                    placeholder="เบอร์โทร หรือ เลขประจำตัว 13 หลัก"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ที่ตั้งร้าน / พิกัดแพปลา (สำหรับไรเดอร์ FlowFood เข้ารับ)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="เช่น ท่าเรือประมงอ่างศิลา ล็อค 12 หรือ ตลาดสดบางแสน"
                  rows={2}
                  className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                />
              </div>
            </div>

            {/* Image Selection / Preset */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>รูปภาพหน้าร้านค้า / โลโก้</span>
                <span className="text-[10px] text-slate-400 font-normal">เลือกรูปภาพตัวอย่างด้านล่าง</span>
              </label>
              <div className="flex items-center gap-3">
                <img
                  src={avatarUrl}
                  alt="Shop Preview"
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500 shrink-0 shadow-xs"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 grid grid-cols-4 gap-2">
                  {[
                    '/images/products/kaokao-logo.jpg',
                    '/images/products/dish-grilled-shrimp-1.jpg',
                    '/images/products/dish-curry-crab-6.jpg',
                    '/images/products/dish-seafood-set-5.jpg',
                  ].map((url, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setAvatarUrl(url)}
                      className={`h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        avatarUrl === url ? 'border-emerald-600 ring-2 ring-emerald-200' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Option ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Terms highlight */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                เมื่อกดลงทะเบียน คุณจะได้รับสิทธิ์เข้าใช้งาน <strong>FlowFood Merchant Portal</strong> เพื่อจัดการเมนูอาหารทะเล, ปรับสต็อก และรับออเดอร์สดจากลูกค้าได้ทันที
              </span>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>

          <button
            type="submit"
            form="merchant-reg-form"
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>ลงทะเบียน & เข้าสู่ระบบจัดการร้าน</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
