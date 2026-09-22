import { useState, useEffect, useId } from 'react';
import { 
  X, 
  MapPin, 
  Plus, 
  Home, 
  Building2, 
  Briefcase, 
  Navigation, 
  CheckCircle2, 
  Edit3, 
  RotateCcw,
  Sparkles,
  Bike,
  Clock,
  Check
} from 'lucide-react';
import { 
  SHOP_LOCATION, 
  PRESET_DELIVERY_LOCATIONS, 
  calculateDistanceFromShop, 
  calculateDeliveryFee, 
  estimateDeliveryMinutes,
  DeliveryPoint
} from '../utils/locationUtils';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress: string;
  currentDistanceKm?: number;
  onSaveAddress: (address: string, distanceKm?: number) => void;
}

export function AddressModal({
  isOpen,
  onClose,
  currentAddress,
  currentDistanceKm = 0.3,
  onSaveAddress,
}: AddressModalProps) {
  // Tabs: 'presets' (choose from popular spots) vs 'edit' (edit address text and distance directly)
  const [activeTab, setActiveTab] = useState<'presets' | 'edit'>('presets');
  
  // Selected address state
  const [selectedAddress, setSelectedAddress] = useState(currentAddress);
  const [selectedDistance, setSelectedDistance] = useState<number>(currentDistanceKm);
  
  // Custom edit state
  const [editableAddressText, setEditableAddressText] = useState(currentAddress);
  const [landmarkNote, setLandmarkNote] = useState('');
  const [editableDistanceKm, setEditableDistanceKm] = useState<number>(currentDistanceKm);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const addressTextareaId = useId();
  const landmarkInputId = useId();
  const distanceSliderId = useId();

  // Synchronize when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAddress(currentAddress);
      setSelectedDistance(currentDistanceKm);
      setEditableAddressText(currentAddress);
      setEditableDistanceKm(currentDistanceKm);
      setSaveSuccess(false);
    }
  }, [isOpen, currentAddress, currentDistanceKm]);

  if (!isOpen) return null;

  // Handle selecting a preset location
  const handleSelectPreset = (loc: DeliveryPoint) => {
    const full = `${loc.title} (${loc.details})`;
    const dist = calculateDistanceFromShop(loc.lat, loc.lng);
    setSelectedAddress(full);
    setSelectedDistance(dist);
    setEditableAddressText(full);
    setEditableDistanceKm(dist);
  };

  // Handle editing a specific preset location
  const handleEditFromPreset = (loc: DeliveryPoint) => {
    const full = `${loc.title} (${loc.details})`;
    const dist = calculateDistanceFromShop(loc.lat, loc.lng);
    setEditableAddressText(full);
    setEditableDistanceKm(dist);
    setActiveTab('edit');
  };

  // Confirm selection or edits
  const handleConfirm = () => {
    let finalAddress = activeTab === 'edit' ? editableAddressText.trim() : selectedAddress.trim();
    if (!finalAddress) {
      finalAddress = currentAddress;
    }
    
    // Append landmark if provided in edit mode and not already in text
    if (activeTab === 'edit' && landmarkNote.trim() && !finalAddress.includes(landmarkNote.trim())) {
      finalAddress = `${finalAddress} [จุดสังเกต: ${landmarkNote.trim()}]`;
    }

    const finalDistance = activeTab === 'edit' ? editableDistanceKm : selectedDistance;

    setSaveSuccess(true);
    setTimeout(() => {
      onSaveAddress(finalAddress, finalDistance);
      onClose();
    }, 250);
  };

  const getIcon = (type: DeliveryPoint['iconType']) => {
    switch (type) {
      case 'home': return Home;
      case 'work': return Briefcase;
      default: return Building2;
    }
  };

  // Quick insertion helpers for address editing
  const handleAppendText = (textToAppend: string) => {
    setEditableAddressText((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return textToAppend;
      if (trimmed.includes(textToAppend)) return prev;
      return `${trimmed} ${textToAppend}`;
    });
  };

  const currentFee = calculateDeliveryFee(activeTab === 'edit' ? editableDistanceKm : selectedDistance);
  const currentEta = estimateDeliveryMinutes(activeTab === 'edit' ? editableDistanceKm : selectedDistance);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 pb-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-orange-100 text-orange-600 rounded-2xl shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                สถานที่และที่อยู่จัดส่ง (Delivery Address)
              </h3>
              <p className="text-xs text-slate-500">
                แก้ไขข้อความที่อยู่ ระบุบ้านเลขที่ หรือเลือกจากจุดส่งรอบร้าน
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 sm:px-5 pt-3 pb-2 bg-slate-50 border-b border-slate-200/70 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-white text-orange-600 shadow-sm border border-slate-200/80 ring-2 ring-orange-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>📍 จุดจัดส่งยอดนิยม ({PRESET_DELIVERY_LOCATIONS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditableAddressText(selectedAddress || currentAddress);
              setEditableDistanceKm(selectedDistance || currentDistanceKm);
              setActiveTab('edit');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'edit'
                ? 'bg-white text-orange-600 shadow-sm border border-slate-200/80 ring-2 ring-orange-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>✏️ พิมพ์/แก้ไขที่อยู่เองอย่างละเอียด</span>
          </button>
        </div>

        {/* Shop Origin Announcement */}
        <div className="mx-4 sm:mx-5 mt-3 p-3 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 rounded-2xl border border-orange-200/70 shrink-0 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
              <Navigation className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-extrabold text-orange-950 truncate">
                  ต้นทางครัวกุ้งเตาถ่าน: {SHOP_LOCATION.name}
                </span>
                <span className="text-[10px] bg-orange-200/70 text-orange-900 font-bold px-1.5 py-0.5 rounded shrink-0">
                  ครัวลำลูกกา
                </span>
              </div>
              <p className="text-[11px] text-orange-800/90 mt-0.5 line-clamp-1">
                📍 {SHOP_LOCATION.address}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* TAB 1: PRESET LOCATIONS */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              {/* Current Active Address Card */}
              <div className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-orange-900 mb-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <span>ที่อยู่จัดส่งที่กำลังใช้งานอยู่:</span>
                  </div>
                  <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                    {currentAddress}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-orange-800">
                    <span>📏 ห่างจากร้าน {currentDistanceKm} กม.</span>
                    <span>•</span>
                    <span>🛵 ค่าส่ง {calculateDeliveryFee(currentDistanceKm) === 0 ? 'ฟรี!' : `฿${calculateDeliveryFee(currentDistanceKm)}`}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditableAddressText(currentAddress);
                    setEditableDistanceKm(currentDistanceKm);
                    setActiveTab('edit');
                  }}
                  className="px-3.5 py-2 bg-white hover:bg-orange-100 text-orange-700 border border-orange-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all shrink-0 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>แก้ไขข้อความนี้</span>
                </button>
              </div>

              {/* Presets List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    จุดส่งยอดนิยมรอบร้าน (ลำลูกกา-ปทุมธานี)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    คลิกเพื่อเลือกหรือนำไปแก้ไขต่อ
                  </span>
                </div>

                <div className="space-y-2.5">
                  {PRESET_DELIVERY_LOCATIONS.map((loc) => {
                    const full = `${loc.title} (${loc.details})`;
                    const isSelected = selectedAddress === full;
                    const dist = calculateDistanceFromShop(loc.lat, loc.lng);
                    const fee = calculateDeliveryFee(dist);
                    const eta = estimateDeliveryMinutes(dist);
                    const Icon = getIcon(loc.iconType);

                    return (
                      <div
                        key={loc.id}
                        className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
                        }`}
                      >
                        <div 
                          className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleSelectPreset(loc)}
                        >
                          <div
                            className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                              isSelected ? 'bg-orange-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                {loc.title}
                              </span>
                              <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
                                {loc.tag}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {loc.details}
                            </p>

                            <div className="flex items-center gap-2 mt-1 text-[10px] font-medium text-slate-600">
                              <span className="bg-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded">
                                📏 {dist} กม.
                              </span>
                              <span>🛵 ค่าส่ง {fee === 0 ? 'ฟรี' : `฿${fee}`}</span>
                              <span>⏱️ ~{eta}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 w-full sm:w-auto justify-end">
                          <button
                            type="button"
                            onClick={() => handleEditFromPreset(loc)}
                            className="px-2.5 py-1.5 text-slate-600 hover:text-orange-700 hover:bg-orange-50 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="นำจุดนี้ไปใส่บ้านเลขที่หรือแก้ไขข้อความ"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-orange-500" />
                            <span>แก้ไข/ใส่บ้านเลขที่</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectPreset(loc)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              isSelected
                                ? 'bg-orange-500 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>เลือกแล้ว</span>
                              </>
                            ) : (
                              <span>เลือกจุดนี้</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Button to go to manual edit */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditableAddressText(selectedAddress || currentAddress);
                    setEditableDistanceKm(selectedDistance || currentDistanceKm);
                    setActiveTab('edit');
                  }}
                  className="w-full py-3 px-4 border-2 border-dashed border-orange-300 hover:border-orange-500 bg-orange-50/30 hover:bg-orange-50 text-orange-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-orange-600" />
                  <span>พิมพ์หรือแก้ไขที่อยู่จัดส่งใหม่อื่นๆ ตามต้องการ</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EDIT ADDRESS MODE */}
          {activeTab === 'edit' && (
            <div className="space-y-4">
              {/* Quick Preset Copy Actions */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium text-[11px] mr-1">
                  ดึงข้อความด่วน:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditableAddressText(currentAddress);
                    setEditableDistanceKm(currentDistanceKm);
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-slate-500" />
                  <span>ที่อยู่ปัจจุบัน</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditableAddressText('หมู่บ้านพฤกษาวิลเลจ 1 (ซอย 35 สุดซอยขวามือ บึงคำพร้อย ลำลูกกา ปทุมธานี)');
                    setEditableDistanceKm(0.3);
                  }}
                  className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  พฤกษาวิลเลจ 1 (0.3 กม.)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditableAddressText('ตลาดเอซี ลำลูกกา คลอง 4 ต.ลาดสวาย อ.ลำลูกกา จ.ปทุมธานี 12150');
                    setEditableDistanceKm(3.5);
                  }}
                  className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  ตลาดเอซี คลอง 4 (3.5 กม.)
                </button>
              </div>

              {/* Full Address Input Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor={addressTextareaId} className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-600" />
                    <span>พิมพ์ข้อความที่อยู่จัดส่งแบบละเอียด *</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {editableAddressText.length} ตัวอักษร
                  </span>
                </div>

                <textarea
                  id={addressTextareaId}
                  rows={3}
                  value={editableAddressText}
                  onChange={(e) => setEditableAddressText(e.target.value)}
                  placeholder="เช่น บ้านเลขที่ 88/19 หมู่บ้านพฤกษาวิลเลจ 1 ซอย 35 สุดซอยขวามือ ต.บึงคำพร้อย อ.ลำลูกกา ปทุมธานี 12150"
                  className="w-full text-xs sm:text-sm p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none leading-relaxed transition-all"
                />

                {/* Quick Add Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-medium">กดเพิ่มคำต่อท้าย:</span>
                  {['ซอย 35', 'หน้าป้อมยาม', 'ตึก A', 'ชั้น 2', 'ห้อง 302', 'โทรหาก่อนถึง 5 นาที'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAppendText(tag)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-orange-100 hover:text-orange-800 text-slate-600 text-[10px] font-medium rounded-md transition-colors cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Landmark or Note to Rider */}
              <div className="space-y-1">
                <label htmlFor={landmarkInputId} className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>จุดสังเกต / รายละเอียดเพิ่มเติม (ถ้ามี)</span>
                </label>
                <input
                  id={landmarkInputId}
                  type="text"
                  value={landmarkNote}
                  onChange={(e) => setLandmarkNote(e.target.value)}
                  placeholder="เช่น ประตูรั้วสีส้ม, ติดกับร้านสะดวกซื้อ, ให้วางไว้ที่โต๊ะหน้าบ้าน"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none"
                />
              </div>

              {/* Distance adjustment slider */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor={distanceSliderId} className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Bike className="w-4 h-4 text-orange-600" />
                    <span>ระยะทางจากร้านกุ้งเผาเผา (กม.):</span>
                  </label>
                  <span className="text-sm font-black text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-lg font-mono">
                    {editableDistanceKm} กม.
                  </span>
                </div>

                <input
                  id={distanceSliderId}
                  type="range"
                  min="0.2"
                  max="25"
                  step="0.1"
                  value={editableDistanceKm}
                  onChange={(e) => setEditableDistanceKm(parseFloat(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />

                {/* Distance Quick Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '0.3 กม. (หมู่บ้านพฤกษาวิลเลจ)', val: 0.3 },
                    { label: '1.5 กม. (เลียบคลอง 5)', val: 1.5 },
                    { label: '3.5 กม. (ตลาดเอซี)', val: 3.5 },
                    { label: '7.0 กม. (สายไหม-วงศกร)', val: 7.0 },
                    { label: '12.0 กม. (รังสิต)', val: 12.0 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setEditableDistanceKm(preset.val)}
                      className={`text-[10px] px-2 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        editableDistanceKm === preset.val
                          ? 'bg-orange-500 text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Calculation Summary Bar */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Bike className="w-3.5 h-3.5 text-orange-600" />
                    <span>ค่าจัดส่ง:</span>
                    <strong className="text-sm font-black text-orange-600">
                      {calculateDeliveryFee(editableDistanceKm) === 0 ? 'ฟรี (ในหมู่บ้าน)' : `฿${calculateDeliveryFee(editableDistanceKm)}`}
                    </strong>
                  </div>

                  <div className="flex items-center gap-1 text-slate-600 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>เวลาจัดส่งประมาณ:</span>
                    <strong className="text-slate-900">{estimateDeliveryMinutes(editableDistanceKm)}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 pt-3 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 hidden sm:block">
            {activeTab === 'presets' ? (
              <span>ระยะทาง {selectedDistance} กม. • ค่าส่ง {currentFee === 0 ? 'ฟรี' : `฿${currentFee}`}</span>
            ) : (
              <span>ระยะทาง {editableDistanceKm} กม. • ค่าส่ง {currentFee === 0 ? 'ฟรี' : `฿${currentFee}`}</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>บันทึกแล้ว!</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{activeTab === 'edit' ? 'บันทึกที่อยู่จัดส่งนี้' : 'ยืนยันใช้จุดจัดส่งนี้'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
