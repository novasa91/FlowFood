import { useState } from 'react';
import { 
  Store, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Package, 
  TrendingUp, 
  Clock, 
  Eye, 
  Power, 
  Flame, 
  ChevronRight, 
  Phone, 
  ShoppingBag, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Fish,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { SeafoodItem, Order, OrderStatus, MerchantProfile } from '../types';
import { MerchantProductModal } from './MerchantProductModal';
import { MerchantEditProfileModal } from './MerchantEditProfileModal';
import { DailySalesChart } from './DailySalesChart';

interface MerchantDashboardProps {
  merchant: MerchantProfile;
  products: SeafoodItem[];
  orders: Order[];
  onUpdateProducts: (newProducts: SeafoodItem[]) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onBackToCustomerView: () => void;
  onUpdateMerchantProfile: (updated: MerchantProfile) => void;
  onOpenCall?: (target: 'rider' | 'restaurant') => void;
}

export function MerchantDashboard({
  merchant,
  products,
  orders,
  onUpdateProducts,
  onUpdateOrderStatus,
  onBackToCustomerView,
  onUpdateMerchantProfile,
  onOpenCall,
}: MerchantDashboardProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'profile'>('analytics');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'instock' | 'outofstock'>('all');
  
  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SeafoodItem | null>(null);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Shop status toggle
  const handleToggleShopOpen = () => {
    onUpdateMerchantProfile({
      ...merchant,
      isOpen: !merchant.isOpen,
    });
  };

  // Toggle single item stock
  const handleToggleStock = (productId: string) => {
    const updated = products.map((item) => {
      if (item.id === productId) {
        return { ...item, inStock: !item.inStock };
      }
      return item;
    });
    onUpdateProducts(updated);
  };

  // Delete product
  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเมนู "${productName}" ออกจากร้านค้า?`)) {
      const updated = products.filter((item) => item.id !== productId);
      onUpdateProducts(updated);
    }
  };

  // Save product from modal
  const handleSaveProduct = (savedItem: SeafoodItem) => {
    const exists = products.some((p) => p.id === savedItem.id);
    let updated: SeafoodItem[];
    if (exists) {
      updated = products.map((p) => (p.id === savedItem.id ? savedItem : p));
    } else {
      updated = [savedItem, ...products];
    }
    onUpdateProducts(updated);
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // Filtered products
  const filteredProducts = products.filter((item) => {
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStock =
      stockFilter === 'all' ||
      (stockFilter === 'instock' && item.inStock) ||
      (stockFilter === 'outofstock' && !item.inStock);

    return matchCategory && matchQuery && matchStock;
  });

  // Analytics calculations
  const totalSalesRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const activeOrdersCount = orders.filter((o) => o.status !== 'delivered').length;
  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = products.length - inStockCount;

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-900 pb-20">
      {/* Top Merchant Navbar */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToCustomerView}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">ดูหน้าร้าน FlowFood</span>
            </button>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <img
                src={merchant.avatarUrl}
                alt={merchant.shopName}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-500 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-extrabold text-white truncate max-w-[180px] sm:max-w-xs">
                    {merchant.shopName}
                  </h1>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    Merchant
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {merchant.ownerName} • {merchant.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Shop Open Status & Back Button */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleShopOpen}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                merchant.isOpen
                  ? 'bg-emerald-600/90 text-white hover:bg-emerald-600 shadow-2xs'
                  : 'bg-rose-900/60 text-rose-300 border border-rose-700 hover:bg-rose-900/80'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${merchant.isOpen ? 'bg-white animate-pulse' : 'bg-rose-400'}`} />
              <span>{merchant.isOpen ? 'ร้านเปิดรับออเดอร์' : 'พักร้านชั่วคราว'}</span>
            </button>

            <button
              onClick={onBackToCustomerView}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>หน้าร้านค้า</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-4 sm:gap-6 text-xs font-bold border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>สรุปยอดขายรายวัน (Analytics)</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'products'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>จัดการสินค้า & สต็อก ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer relative ${
              activeTab === 'orders'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>คำสั่งซื้อเข้าหน้าร้าน</span>
            {activeOrdersCount > 0 && (
              <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>ข้อมูลร้านค้า & บัญชีรับเงิน</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI / Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div 
            onClick={() => setActiveTab('analytics')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
              activeTab === 'analytics'
                ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-white border-slate-200/80 shadow-2xs hover:border-emerald-400 hover:shadow-xs'
            }`}
            title="คลิกเพื่อดูกราฟสรุปยอดขายรายวัน"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold group-hover:text-emerald-700">ยอดขายรวม</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-emerald-800">
              ฿{totalSalesRevenue.toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-[10px] text-emerald-600 font-semibold mt-0.5">
              <span>จาก {orders.length} ออเดอร์</span>
              <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[9px] font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                กราฟ recharts ↗
              </span>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('orders')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
              activeTab === 'orders'
                ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-white border-slate-200/80 shadow-2xs hover:border-amber-400 hover:shadow-xs'
            }`}
            title="คลิกเพื่อดูคำสั่งซื้อเข้าหน้าร้าน"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold group-hover:text-amber-700">ออเดอร์ต้องจัดเตรียม</span>
              <ShoppingBag className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-amber-800">
              {activeOrdersCount}
            </p>
            <p className="text-[10px] text-amber-600 font-semibold mt-0.5 truncate">
              {activeOrdersCount > 0 ? 'กำลังรอทำอาหาร / ส่งไรเดอร์' : 'เคลียร์ออเดอร์ครบแล้ว'}
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('products')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
              activeTab === 'products'
                ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-white border-slate-200/80 shadow-2xs hover:border-emerald-400 hover:shadow-xs'
            }`}
            title="คลิกเพื่อจัดการสต็อกสินค้า"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold group-hover:text-emerald-700">เมนูพร้อมขาย</span>
              <Package className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-emerald-800">
              {inStockCount} <span className="text-xs font-normal text-slate-400">/ {products.length}</span>
            </p>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5 truncate">
              ของหมดชั่วคราว {outOfStockCount} รายการ
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">เรตติ้งร้านค้า</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-1">
              <span>{merchant.rating.toFixed(1)}</span>
              <span className="text-amber-400 text-sm">★</span>
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5 truncate">
              FlowFood Partner รับประกัน
            </p>
          </div>
        </div>

        {/* TAB: Daily Sales Analytics & Recharts Overview */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <DailySalesChart orders={orders} shopName={merchant.shopName} />
          </div>
        )}

        {/* TAB 1: Product & Inventory Management */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Action Bar (Search, Category, Add Button) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อเมนูอาหารทะเล..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 overflow-x-auto">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">ทุกหมวดหมู่</option>
                  <option value="shrimp">กุ้งแม่น้ำ</option>
                  <option value="crab">ปูม้า/ปูไข่</option>
                  <option value="fish">ปลากะพง</option>
                  <option value="shellfish">หอยนางรม</option>
                  <option value="ready_to_eat">ปรุงสุก</option>
                  <option value="sets">เซ็ตปาร์ตี้</option>
                </select>

                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">สถานะทั้งหมด</option>
                  <option value="instock">พร้อมขาย</option>
                  <option value="outofstock">ของหมด</option>
                </select>

                {/* Add New Product Button */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มเมนูใหม่</span>
                </button>
              </div>
            </div>

            {/* Product List Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-2xs">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">ไม่พบสินค้าที่ตรงกับเงื่อนไข</h3>
                <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหา หรือกดเพิ่มเมนูใหม่เข้าร้าน</p>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
                >
                  + เพิ่มเมนูอาหารทะเล
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col shadow-2xs hover:shadow-xs ${
                      product.inStock ? 'border-slate-200' : 'border-rose-200 bg-rose-50/20'
                    }`}
                  >
                    {/* Image & Quick Badges */}
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${
                          !product.inStock ? 'grayscale-50 opacity-80' : ''
                        }`}
                        referrerPolicy="no-referrer"
                      />

                      {/* Stock Badge */}
                      <button
                        type="button"
                        onClick={() => handleToggleStock(product.id)}
                        className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                          product.inStock
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-rose-600 text-white hover:bg-rose-700'
                        }`}
                        title="คลิกเพื่อสลับสถานะสินค้า"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-white animate-pulse' : 'bg-rose-200'}`} />
                        <span>{product.inStock ? 'พร้อมขาย' : 'ของหมด'}</span>
                      </button>

                      {product.badge && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold backdrop-blur-xs">
                          {product.badge}
                        </span>
                      )}

                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white bg-slate-900/70 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                        <span className="truncate max-w-[180px]">{product.freshnessSource}</span>
                        <span>{product.prepTimeMinutes} นาที</span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1">
                            {product.name}
                          </h4>
                          <span className="text-sm font-black text-emerald-700 shrink-0">
                            ฿{product.price}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mb-2">
                          {product.nameEn}
                        </p>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                          {product.description}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <span>วิธีปรุง:</span>
                          <span className="font-bold text-slate-800">
                            {product.cookingOptions?.length || 3} แบบ
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(product);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="แก้ไขสินค้า"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="ลบเมนูนี้"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Live Merchant Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  รายการออเดอร์ลูกค้าส่งถึงร้านค้า
                </h3>
                <p className="text-xs text-slate-500">
                  รับคำสั่งซื้อ ปรุงอาหารทะเลสด และส่งมอบต่อไรเดอร์ FlowFood
                </p>
              </div>

              <div className="flex items-center gap-2">
                {activeOrdersCount > 0 && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full animate-pulse">
                    มี {activeOrdersCount} ออเดอร์ที่ต้องดำเนินการ
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab('analytics')}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>ดูกราฟยอดขาย recharts</span>
                </button>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-2xs">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">ยังไม่มีคำสั่งซื้อเข้ามาในขณะนี้</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  เมื่อลูกค้ากดสั่งซื้อกุ้งแม่น้ำ ปูม้า หรือเมนูในร้าน ระบบจะแสดงออเดอร์สดที่นี่ทันที
                </p>
                <button
                  onClick={onBackToCustomerView}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
                >
                  ลองสั่งซื้อจำลองจากหน้าร้าน
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isPendingCooking = order.status === 'confirmed';
                  const isCooking = order.status === 'cooking';
                  const isPickingUp = order.status === 'picking_up';
                  const isDelivering = order.status === 'delivering';
                  const isDelivered = order.status === 'delivered';

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden p-5 space-y-4"
                    >
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black font-mono bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg">
                            #{order.orderNumber}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-800">
                              {order.deliveryAddress.recipientName}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-2">
                              {order.createdAt}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black ${
                              isDelivered
                                ? 'bg-emerald-100 text-emerald-800'
                                : isDelivering
                                ? 'bg-blue-100 text-blue-800'
                                : isCooking
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {isDelivered
                              ? 'จัดส่งสำเร็จแล้ว ✅'
                              : isDelivering
                              ? 'ไรเดอร์กำลังจัดส่ง 🛵'
                              : isPickingUp
                              ? 'รอไรเดอร์มารับ 📦'
                              : isCooking
                              ? 'กำลังปรุงในครัว 🔥'
                              : 'ออเดอร์ใหม่ รอรับ ⚡'}
                          </span>

                          <span className="text-sm font-black text-slate-900">
                            ฿{order.total}
                          </span>
                        </div>
                      </div>

                      {/* Items Ordered */}
                      <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                        <p className="text-xs font-bold text-slate-700">รายการอาหารที่สั่ง ({order.items.length} อย่าง):</p>
                        {order.items.map((cartItem, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 last:border-0">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
                                {cartItem.quantity}x
                              </span>
                              <div>
                                <span className="font-semibold text-slate-800">{cartItem.item.name}</span>
                                <div className="text-[10px] text-slate-500 flex flex-wrap gap-2">
                                  <span>{cartItem.options.cooking.name}</span>
                                  <span>•</span>
                                  <span>{cartItem.options.sauce.name}</span>
                                  <span>•</span>
                                  <span>{cartItem.options.spiciness}</span>
                                </div>
                              </div>
                            </div>
                            <span className="font-bold text-slate-700">
                              ฿{cartItem.item.price * cartItem.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Customer Note & Rider Contact */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                        <div>
                          <span>ที่อยู่จัดส่ง: </span>
                          <span className="font-semibold text-slate-800">{order.deliveryAddress.addressText}</span>
                          {order.deliveryAddress.details && (
                            <span className="text-slate-500"> ({order.deliveryAddress.details})</span>
                          )}
                        </div>

                        {order.rider && (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500">ไรเดอร์:</span>
                            <span className="font-bold text-slate-800">{order.rider.name}</span>
                            {onOpenCall && (
                              <button
                                type="button"
                                onClick={() => onOpenCall('rider')}
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Phone className="w-3 h-3" />
                                <span>โทรหาไรเดอร์</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Status Transition Actions for Merchant */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                        {isPendingCooking && (
                          <button
                            type="button"
                            onClick={() => onUpdateOrderStatus(order.id, 'cooking')}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Flame className="w-3.5 h-3.5" />
                            <span>รับออเดอร์ & เริ่มปรุงอาหาร</span>
                          </button>
                        )}

                        {isCooking && (
                          <button
                            type="button"
                            onClick={() => onUpdateOrderStatus(order.id, 'picking_up')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>ปรุงเสร็จแล้ว • เรียกไรเดอร์มารับ</span>
                          </button>
                        )}

                        {isPickingUp && (
                          <button
                            type="button"
                            onClick={() => onUpdateOrderStatus(order.id, 'delivering')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>ส่งมอบอาหารให้ไรเดอร์แล้ว</span>
                          </button>
                        )}

                        {isDelivering && (
                          <button
                            type="button"
                            onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>ยืนยันจัดส่งสำเร็จ</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Shop Profile & Settings */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={merchant.avatarUrl}
                  alt={merchant.shopName}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500 shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">{merchant.shopName}</h3>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      merchant.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {merchant.isOpen ? '🟢 เปิดร้านปกติ' : '🔴 ปิดร้านชั่วคราว'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{merchant.category}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                    ลงทะเบียนร้านค้าเมื่อ {merchant.registeredAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleShopOpen}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                    merchant.isOpen
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{merchant.isOpen ? 'คลิกเพื่อปิดร้านชั่วคราว' : 'คลิกเพื่อเปิดรับออเดอร์'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(true)}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>แก้ไขข้อมูลร้านค้า</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-1">ชื่อผู้ติดต่อ / เจ้าของร้าน</span>
                <span className="font-bold text-slate-800 text-sm">{merchant.ownerName}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-1">เบอร์โทรศัพท์ติดต่อ</span>
                <span className="font-bold text-slate-800 text-sm">{merchant.phone}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-1">บัญชีพร้อมเพย์รับเงิน (PromptPay)</span>
                <span className="font-bold text-emerald-700 text-sm font-mono">{merchant.promptPayNumber}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl relative group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400">พิกัดแพปลา / ที่ตั้งร้าน</span>
                  <button
                    type="button"
                    onClick={() => setIsEditProfileModalOpen(true)}
                    className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs hover:bg-orange-50 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>แก้ไขที่อยู่ร้าน</span>
                  </button>
                </div>
                <span className="font-bold text-slate-800 text-sm">{merchant.address}</span>
              </div>
            </div>

            {/* Quick Preview Card */}
            <div className="p-4 bg-orange-50/60 border border-orange-200/80 rounded-2xl">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-orange-950 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-orange-600" />
                  <span>ตัวอย่างการแสดงผลร้านค้าหน้าแรก (Customer View Preview)</span>
                </span>
                <span className="text-[11px] font-semibold text-orange-700">
                  {merchant.isOpen ? '🟢 สถานะ: ร้านเปิดรับออเดอร์' : '🔴 สถานะ: ร้านปิดชั่วคราว'}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                ลูกค้าจะเห็นข้อมูลร้าน <strong>"{merchant.shopName}"</strong> พร้อมเบอร์ติดต่อ <strong>{merchant.phone}</strong> และสถานะเปิด/ปิดร้านที่แถบเมนูด้านบนและแบนเนอร์หลัก
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onBackToCustomerView}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                กลับไปดูหน้าร้าน FlowFood Seafood
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('คุณต้องการออกจากระบบจัดการร้านค้านี้ใช่หรือไม่?')) {
                    localStorage.removeItem('flowfood_merchant');
                    window.location.reload();
                  }
                }}
                className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
              >
                ออกจากระบบร้านค้านี้
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Product Add / Edit Modal */}
      <MerchantProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        productToEdit={editingProduct}
        onSaveProduct={handleSaveProduct}
      />

      {/* Merchant Profile Edit Modal */}
      <MerchantEditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        merchant={merchant}
        onSaveProfile={onUpdateMerchantProfile}
      />
    </div>
  );
}
