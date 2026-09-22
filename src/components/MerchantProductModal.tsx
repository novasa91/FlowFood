import { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Plus, 
  Trash2, 
  Flame, 
  Fish, 
  DollarSign, 
  Clock, 
  Layers, 
  ShieldCheck,
  Tag
} from 'lucide-react';
import { SeafoodItem, WeightOption, CookingOption } from '../types';

interface MerchantProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: SeafoodItem | null;
  onSaveProduct: (product: SeafoodItem) => void;
}

const PRESET_IMAGES = [
  { label: 'กุ้งเผาหัวมันแก้ว 100%', url: '/images/products/dish-grilled-shrimp-1.jpg' },
  { label: 'กุ้งแม่น้ำผ่าหลังมันเยิ้ม', url: '/images/products/dish-grilled-shrimp-2.jpg' },
  { label: 'กุ้งหัวมันแก้วคัดพิเศษ', url: '/images/products/dish-head-fat-3.jpg' },
  { label: 'ชุดกุ้งเผาครอบครัว 1 กก.', url: '/images/products/dish-grilled-shrimp-4.jpg' },
  { label: 'เซ็ตกุ้งเผาเผา แกรนด์ปาร์ตี้', url: '/images/products/dish-seafood-set-5.jpg' },
  { label: 'ปูม้านึ่ง & กรรเชียงปูผัดผงกะหรี่', url: '/images/products/dish-curry-crab-6.jpg' },
  { label: 'หมึกกล้วยย่างเตาถ่านไข่ทะลัก', url: '/images/products/dish-squid-bbq-7.jpg' },
  { label: 'ปูไข่ดองน้ำปลาแท้สูตรกุ้งเผาเผา', url: '/images/products/dish-special-8.jpg' },
  { label: 'กุ้งหัวมันแก้วแช่น้ำปลา', url: '/images/products/dish-multichannel-1.jpg' },
  { label: 'ข้าวผัดมันกุ้งเสวย', url: '/images/products/dish-multichannel-2.jpg' },
  { label: 'ต้มยำกุ้งแม่น้ำหม้อไฟ', url: '/images/products/dish-multichannel-3.jpg' },
  { label: 'ปลากะพงเผาเกลือสมุนไพร', url: '/images/products/dish-multichannel-4.jpg' },
  { label: 'หอยเชลล์ย่างเนยกระเทียมชีส', url: '/images/products/dish-multichannel-5.jpg' },
  { label: 'ข้าวคลุกมันกุ้งหอมเจียว', url: '/images/products/dish-multichannel-6.jpg' },
  { label: 'น้ำจิ้มซีฟู้ดมะนาวแป้นสดแท้', url: '/images/products/dish-multichannel-7.jpg' },
];

export function MerchantProductModal({
  isOpen,
  onClose,
  productToEdit,
  onSaveProduct,
}: MerchantProductModalProps) {
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState<SeafoodItem['category']>('shrimp');
  const [price, setPrice] = useState(450);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [description, setDescription] = useState('');
  const [freshnessSource, setFreshnessSource] = useState('เรือประมงสดวันต่อวัน คัดไซส์พิเศษ');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(20);
  const [badge, setBadge] = useState('สดคัดพิเศษ 🦐');
  const [inStock, setInStock] = useState(true);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setNameEn(productToEdit.nameEn);
      setCategory(productToEdit.category);
      setPrice(productToEdit.price);
      setOriginalPrice(productToEdit.originalPrice);
      setImageUrl(productToEdit.imageUrl);
      setDescription(productToEdit.description);
      setFreshnessSource(productToEdit.freshnessSource);
      setPrepTimeMinutes(productToEdit.prepTimeMinutes);
      setBadge(productToEdit.badge || '');
      setInStock(productToEdit.inStock);
    } else {
      // Default new product values
      setName('');
      setNameEn('');
      setCategory('shrimp');
      setPrice(490);
      setOriginalPrice(550);
      setImageUrl(PRESET_IMAGES[0].url);
      setDescription('อาหารทะเลสดใหม่ คัดเกรดพรีเมียมจากทะเล ปรุงสุกสดใหม่ทุกจานพร้อมน้ำจิ้มซีฟู้ดมะนาวแท้');
      setFreshnessSource('เรือประมงสดวันต่อวัน คัดเกรด A');
      setPrepTimeMinutes(20);
      setBadge('เมนูใหม่แนะนำ ✨');
      setInStock(true);
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const baseWeightOptions: WeightOption[] = productToEdit?.weightOptions?.length 
      ? productToEdit.weightOptions 
      : [
          { id: 'w-default', name: 'จานมาตรฐาน (ประมาณ 500 กรัม)', priceModifier: 0, isDefault: true },
          { id: 'w-large', name: 'ไซส์จุใจ (ประมาณ 1 กิโลกรัม)', priceModifier: Math.round(price * 0.9) },
        ];

    const baseCookingOptions: CookingOption[] = productToEdit?.cookingOptions?.length 
      ? productToEdit.cookingOptions 
      : [
          { id: 'c-charcoal', name: 'เผาเตาถ่านโบราณ', description: 'หอมกลิ่นควันถ่าน มันเยิ้ม', priceExtra: 0 },
          { id: 'c-steam', name: 'นึ่งสมุนไพรสด', description: 'เนื้อหวานนุ่มละมุน', priceExtra: 0 },
          { id: 'c-raw', name: 'แพ็คน้ำแข็งสดกลับไปทำเอง', description: 'กล่องโฟมเก็บความเย็น', priceExtra: 0 },
        ];

    const savedItem: SeafoodItem = {
      id: productToEdit ? productToEdit.id : `seafood-${Date.now()}`,
      name: name.trim(),
      nameEn: nameEn.trim() || name.trim(),
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      imageUrl,
      description: description.trim(),
      freshnessSource: freshnessSource.trim(),
      prepTimeMinutes: Number(prepTimeMinutes) || 15,
      badge: badge.trim() || undefined,
      rating: productToEdit?.rating || 4.9,
      reviewCount: productToEdit?.reviewCount || 1,
      isPopular: productToEdit?.isPopular ?? true,
      inStock,
      weightOptions: baseWeightOptions,
      cookingOptions: baseCookingOptions,
      sauceOptions: productToEdit?.sauceOptions || [
        { id: 's-green', name: 'น้ำจิ้มซีฟู้ดพริกขี้หนูเขียวมะนาวแป้นแท้ 100%', description: 'รสเปรี้ยวแซ่บจี๊ดจ๊าด สูตรเด็ดประจำร้าน' },
        { id: 's-red', name: 'น้ำจิ้มซีฟู้ดพริกจินดาแดงคั่ว', description: 'เผ็ดหอมกลมกล่อม เค็มนัวกำลังดี' },
      ],
      availableAddOns: productToEdit?.availableAddOns || [
        { id: 'a-rice', name: 'ข้าวสวยหอมมะลิแท้', price: 20 },
        { id: 'a-sauce-extra', name: 'น้ำจิ้มซีฟู้ดขวดใหญ่ (150ml)', price: 45 },
      ],
    };

    onSaveProduct(savedItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Fish className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {productToEdit ? 'แก้ไขข้อมูลเมนูอาหารทะเล' : 'เพิ่มเมนูอาหารทะเลใหม่ในร้าน'}
              </h3>
              <p className="text-[11px] text-slate-400">
                ระบบจัดการสินค้า FlowFood Merchant
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} id="merchant-product-form" className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Status & Category Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">สถานะวางขาย:</span>
              <button
                type="button"
                onClick={() => setInStock(!inStock)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  inStock
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-rose-100 text-rose-700 border border-rose-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-white animate-pulse' : 'bg-rose-500'}`} />
                <span>{inStock ? 'พร้อมขาย (In Stock)' : 'ของหมดชั่วคราว (Out of Stock)'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">หมวดหมู่:</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="shrimp">กุ้งแม่น้ำ & กุ้งลายเสือ</option>
                <option value="crab">ปูม้า & ปูไข่ดอง</option>
                <option value="fish">ปลากะพง & ซาชิมิ</option>
                <option value="shellfish">หอยนางรม & หมึกย่าง</option>
                <option value="ready_to_eat">ปรุงสุก ต้มยำ ข้าวผัด</option>
                <option value="sets">เซ็ตปาร์ตี้สุดคุ้ม</option>
              </select>
            </div>
          </div>

          {/* Name & English Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อเมนู (ภาษาไทย) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น กุ้งแม่น้ำเผาเตาถ่าน จัมโบ้"
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อเมนู (English Name)
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Grilled River Prawn"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Price & Original Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ราคาขายหน้าร้าน (บาท) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">฿</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  min={1}
                  required
                  className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ราคาเดิม/ป้ายลด (บาท)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">฿</span>
                <input
                  type="number"
                  value={originalPrice ?? ''}
                  onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="เช่น 590"
                  className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เวลาปรุงโดยประมาณ (นาที)
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  value={prepTimeMinutes}
                  onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
                  min={5}
                  max={60}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Badge & Freshness Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ป้ายกำกับโปรโมชั่น / ไฮไลท์
              </label>
              <div className="relative">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="เช่น ขายดีอันดับ 1 🔥, สดเป็นๆ 🦐"
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                แหล่งที่มาความสด (สร้างความมั่นใจให้ลูกค้า)
              </label>
              <input
                type="text"
                value={freshnessSource}
                onChange={(e) => setFreshnessSource(e.target.value)}
                placeholder="เช่น ส่งตรงจากท่าเรืออ่างศิลา, สดวันต่อวัน"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              คำบรรยายรสชาติ & จุดเด่นของอาหาร
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="บรรยายความสด หวานฉ่ำ วิธีการทานคู่กับน้ำจิ้มซีฟู้ด..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Image Selection with Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>รูปภาพอาหาร (เลือกภาพพรีเซ็ต หรือกรอก URL)</span>
              <span className="text-[10px] text-slate-400">รูปคมชัด ดึงดูดลูกค้า</span>
            </label>
            <div className="flex items-start gap-3">
              <img
                src={imageUrl}
                alt="Product Preview"
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-emerald-500 shadow-sm shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 space-y-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      title={preset.label}
                      className={`h-9 rounded-lg overflow-hidden border-2 transition-all cursor-pointer relative group ${
                        imageUrl === preset.url ? 'border-emerald-600 ring-2 ring-emerald-200' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      {imageUrl === preset.url && (
                        <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>

          <button
            type="submit"
            form="merchant-product-form"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{productToEdit ? 'บันทึกการแก้ไข' : 'เพิ่มเมนูลงร้านค้า'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
