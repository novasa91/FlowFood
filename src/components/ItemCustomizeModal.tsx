import { useState, useId } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Check, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  ChefHat, 
  Clock 
} from 'lucide-react';
import { 
  SeafoodItem, 
  WeightOption, 
  CookingOption, 
  SauceOption, 
  SpicinessLevel, 
  CartItemOption 
} from '../types';

interface ItemCustomizeModalProps {
  item: SeafoodItem | null;
  onClose: () => void;
  onAddToCart: (item: SeafoodItem, options: CartItemOption, quantity: number) => void;
}

export function ItemCustomizeModal({ item, onClose, onAddToCart }: ItemCustomizeModalProps) {
  if (!item) return null;

  const defaultWeight = item.weightOptions.find((w) => w.isDefault) || item.weightOptions[0];
  const defaultCooking = item.cookingOptions[0];
  const defaultSauce = item.sauceOptions[0];

  const [selectedWeight, setSelectedWeight] = useState<WeightOption>(defaultWeight);
  const [selectedCooking, setSelectedCooking] = useState<CookingOption>(defaultCooking);
  const [selectedSauce, setSelectedSauce] = useState<SauceOption>(defaultSauce);
  const [selectedSpiciness, setSelectedSpiciness] = useState<SpicinessLevel>('เผ็ดปานกลาง (Medium)');
  const [selectedAddOns, setSelectedAddOns] = useState<{ id: string; name: string; price: number }[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  const specialInstructionsId = useId();

  // Calculate unit price based on options
  const basePrice = item.price;
  const weightPrice = selectedWeight ? selectedWeight.priceModifier : 0;
  const cookingPrice = selectedCooking ? selectedCooking.priceExtra : 0;
  const saucePrice = selectedSauce?.isExtraPrice || 0;
  const addOnsTotal = selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);

  const unitPrice = basePrice + weightPrice + cookingPrice + saucePrice + addOnsTotal;
  const totalPrice = unitPrice * quantity;

  const handleToggleAddOn = (addOn: { id: string; name: string; price: number }) => {
    if (selectedAddOns.some((a) => a.id === addOn.id)) {
      setSelectedAddOns(selectedAddOns.filter((a) => a.id !== addOn.id));
    } else {
      setSelectedAddOns([...selectedAddOns, addOn]);
    }
  };

  const handleConfirm = () => {
    const options: CartItemOption = {
      weight: selectedWeight,
      cooking: selectedCooking,
      sauce: selectedSauce,
      spiciness: selectedSpiciness,
      selectedAddOns,
      specialInstructions: specialInstructions.trim() ? specialInstructions.trim() : undefined,
    };
    onAddToCart(item, options, quantity);
    onClose();
  };

  const spicinessOptions: SpicinessLevel[] = [
    'เผ็ดน้อย (Mild)',
    'เผ็ดปานกลาง (Medium)',
    'เผ็ดแซ่บจี๊ด (Very Spicy)',
    'ไม่เผ็ด (No Chili)',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with image */}
        <div className="relative h-48 sm:h-56 shrink-0 bg-slate-100">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

          {/* Wongnai photo badge */}
          <div className="absolute top-3 left-3 bg-slate-950/75 backdrop-blur-xs text-orange-200 border border-orange-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
            <span>ภาพจริงจากร้าน 烤烤 (Wongnai)</span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/80 hover:bg-white text-slate-800 p-2 rounded-full backdrop-blur-xs shadow-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Info overlay on image bottom */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex items-center gap-1.5 text-xs text-orange-300 font-semibold mb-0.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{item.freshnessSource}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold leading-tight">{item.name}</h2>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-white">
                ฿{unitPrice.toLocaleString()}
              </span>
              {item.originalPrice && (
                <span className="text-xs text-slate-300 line-through">
                  ฿{(item.originalPrice + weightPrice).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Customization Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* Section 1: Choose Weight / Size */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>1. เลือกขนาด / ปริมาณ</span>
                <span className="text-orange-700 bg-orange-50 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  จำเป็นต้องเลือก
                </span>
              </label>
              <span className="text-xs text-slate-400">เลือกได้ 1 รายการ</span>
            </div>

            <div className="space-y-2">
              {item.weightOptions.map((w) => {
                const isSelected = selectedWeight.id === w.id;
                return (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWeight(w)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-orange-600 bg-orange-600' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-800">
                        {w.name}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-600">
                      {w.priceModifier === 0 ? 'ราคาเริ่มต้น' : `+฿${w.priceModifier}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Choose Cooking Method */}
          {item.cookingOptions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-orange-600" />
                  <span>2. เลือกวิธีปรุง (ทำสดใหม่)</span>
                  <span className="text-orange-700 bg-orange-50 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    จำเป็นต้องเลือก
                  </span>
                </label>
                <span className="text-xs text-slate-400">เลือกได้ 1 วิธี</span>
              </div>

              <div className="space-y-2">
                {item.cookingOptions.map((c) => {
                  const isSelected = selectedCooking.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCooking(c)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-orange-600 bg-orange-600' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-semibold text-slate-800">
                              {c.name}
                            </span>
                            <p className="text-[11px] text-slate-500">{c.description}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-600">
                          {c.priceExtra === 0 ? 'ฟรี' : `+฿${c.priceExtra}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Dipping Sauce */}
          {item.sauceOptions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-orange-600" />
                  <span>3. น้ำจิ้มซีฟู้ดมะนาวแท้ประจำจาน</span>
                  <span className="text-orange-700 bg-orange-50 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    จำเป็นต้องเลือก
                  </span>
                </label>
              </div>

              <div className="space-y-2">
                {item.sauceOptions.map((s) => {
                  const isSelected = selectedSauce?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSauce(s)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-orange-600 bg-orange-600' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-semibold text-slate-800">
                              {s.name}
                            </span>
                            <p className="text-[11px] text-slate-500">{s.description}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-600">
                          {s.isExtraPrice ? `+฿${s.isExtraPrice}` : 'ฟรี'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 4: Spiciness Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>4. ระดับความเผ็ด</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {spicinessOptions.map((lvl) => {
                const isSelected = selectedSpiciness === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedSpiciness(lvl)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 text-orange-800 ring-1 ring-orange-500'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Add-ons (Optional) */}
          {item.availableAddOns && item.availableAddOns.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-900">
                  5. เมนูทานคู่ &amp; เครื่องเคียงเพิ่มเติม (ไม่บังคับ)
                </label>
                <span className="text-xs text-slate-400">เลือกได้หลายรายการ</span>
              </div>

              <div className="space-y-2">
                {item.availableAddOns.map((addOn) => {
                  const isChecked = selectedAddOns.some((a) => a.id === addOn.id);
                  return (
                    <div
                      key={addOn.id}
                      onClick={() => handleToggleAddOn(addOn)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-orange-500 bg-orange-50/30'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isChecked ? 'border-orange-600 bg-orange-600 text-white' : 'border-slate-300'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-slate-800">
                          {addOn.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-700">
                        +฿{addOn.price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 6: Kitchen Note */}
          <div>
            <label htmlFor={specialInstructionsId} className="block text-sm font-bold text-slate-900 mb-1.5">
              หมายเหตุถึงเชฟ / ครัวอาหารทะเล (ไม่บังคับ)
            </label>
            <input
              id={specialInstructionsId}
              type="text"
              placeholder="เช่น แกะเปลือกกุ้งให้ด้วย, แยกน้ำจิ้ม, ขอผักเคียงเพิ่ม..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Sticky Bottom Actions Bar */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shadow-lg">
          {/* Quantity Stepper */}
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-2 sm:px-3 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-50 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-slate-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 sm:px-3 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white rounded-xl font-bold text-sm sm:text-base flex items-center justify-between shadow-md transition-all cursor-pointer"
          >
            <span>เพิ่มลงตะกร้า</span>
            <span>฿{totalPrice.toLocaleString()}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
