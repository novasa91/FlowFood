import React, { useState, useEffect } from 'react';
import { 
  Store, 
  X, 
  Check, 
  Phone, 
  MapPin, 
  User, 
  CreditCard, 
  Image as ImageIcon, 
  Power,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { MerchantProfile } from '../types';

interface MerchantEditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchant: MerchantProfile;
  onSaveProfile: (updatedProfile: MerchantProfile) => void;
}

export function MerchantEditProfileModal({
  isOpen,
  onClose,
  merchant,
  onSaveProfile,
}: MerchantEditProfileModalProps) {
  const [formData, setFormData] = useState<MerchantProfile>({ ...merchant });
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...merchant });
      setSaveSuccess(false);
    }
  }, [isOpen, merchant]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const handleResetToDefaultKaoKao = () => {
    setFormData({
      ...formData,
      shopName: 'กุ้งเผาเผา 烤烤 (Kǎo Kǎo)',
      ownerName: 'เจ๊หมวย & เฮียเคี้ยง 烤烤',
      category: 'กุ้งเผาหัวมันแก้วเตาถ่าน & อาหารทะเลสด ลำลูกกา',
      phone: '080-382-4909, 096-328-6005',
      address: '31/225 ซอย 35 สุดซอยขวามือ บึงคำพร้อย ลำลูกกา ปทุมธานี (พฤกษาวิลเลจ 1)',
      promptPayNumber: '080-382-4909',
      avatarUrl: '/images/products/dish-grilled-fat-1kg.jpg',
      coverUrl: '/images/products/dish-grilled-fat-1kg.jpg',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">แก้ไขข้อมูลร้านค้า & สถานะเปิด-ปิด</h3>
              <p className="text-xs text-slate-300">ปรับเปลี่ยนข้อมูลร้านที่จะแสดงให้ลูกค้าและในระบบออเดอร์</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-slate-800">
          
          {/* Quick preset action */}
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>ข้อมูลต้นฉบับร้าน <strong>กุ้งเผาเผา 烤烤 (Kǎo Kǎo)</strong> ลำลูกกา</span>
            </div>
            <button
              type="button"
              onClick={handleResetToDefaultKaoKao}
              className="px-3 py-1 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>โหลดค่ามาตรฐาน</span>
            </button>
          </div>

          {/* Shop Open / Closed Status Toggle */}
          <div className={`p-4 rounded-2xl border transition-all ${
            formData.isOpen 
              ? 'bg-emerald-50/70 border-emerald-300' 
              : 'bg-rose-50/70 border-rose-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  formData.isOpen ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}>
                  <Power className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    โหมดสถานะเปิด-ปิดร้านค้า
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {formData.isOpen 
                      ? '🟢 ปัจจุบันร้านเปิดรับออเดอร์ปกติ (แสดงป้ายร้านเปิดในหน้าแรก)' 
                      : '🔴 ปัจจุบันร้านปิดรับออเดอร์ชั่วคราว (แสดงป้ายร้านปิดและพักเตาในหน้าแรก)'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, isOpen: !formData.isOpen })}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  formData.isOpen
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {formData.isOpen ? 'เปิดอยู่ (กดเพื่อปิดร้าน)' : 'ปิดอยู่ (กดเพื่อเปิดร้าน)'}
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-orange-500" />
                <span>ชื่อร้านค้า *</span>
              </label>
              <input
                type="text"
                required
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                placeholder="เช่น กุ้งเผาเผา 烤烤 (Kǎo Kǎo)"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-500" />
                <span>ชื่อผู้ติดต่อ / เจ้าของร้าน *</span>
              </label>
              <input
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                placeholder="ชื่อเจ้าของร้าน"
              />
            </div>
          </div>

          {/* Phone & PromptPay */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-orange-500" />
                <span>เบอร์โทรศัพท์ติดต่อร้าน *</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                placeholder="080-382-4909, 096-328-6005"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-orange-500" />
                <span>เบอร์พร้อมเพย์รับเงิน (PromptPay) *</span>
              </label>
              <input
                type="text"
                required
                value={formData.promptPayNumber}
                onChange={(e) => setFormData({ ...formData, promptPayNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold font-mono text-emerald-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                placeholder="0803824909"
              />
            </div>
          </div>

          {/* Category / Slogan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              หมวดหมู่ / สโลแกนร้านค้า
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              placeholder="กุ้งเผาหัวมันแก้วเตาถ่าน & อาหารทะเลสด ลำลูกกา"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span>ที่อยู่ร้านค้า / พิกัดจุดย่างเตาถ่าน *</span>
            </label>
            <textarea
              required
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white resize-none"
              placeholder="ที่ตั้งร้าน เช่น 31/225 ซอย 35 สุดซอยขวามือ บึงคำพร้อย ลำลูกกา ปทุมธานี (พฤกษาวิลเลจ 1)"
            />
          </div>

          {/* Avatar and Cover URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-orange-500" />
                <span>URL รูปโลโก้ร้าน (Avatar)</span>
              </label>
              <input
                type="text"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-orange-500" />
                <span>URL รูปภาพหน้าปกร้าน (Cover)</span>
              </label>
              <input
                type="text"
                value={formData.coverUrl || ''}
                onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>บันทึกสำเร็จ!</span>
                </>
              ) : (
                <span>บันทึกข้อมูลร้านค้า</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
