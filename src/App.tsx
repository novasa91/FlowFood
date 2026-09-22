import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Sparkles, 
  Search, 
  ShoppingBag, 
  MapPin, 
  PhoneCall, 
  Check, 
  Clock, 
  Flame, 
  ShieldCheck, 
  Fish,
  Utensils,
  MessageCircle,
  Bike,
  Store,
  ArrowRight,
  Bot
} from 'lucide-react';
import { 
  SeafoodItem, 
  CartItem, 
  CartItemOption, 
  Order, 
  OrderStatus, 
  PromoCoupon, 
  RiderInfo,
  LineNotificationItem,
  MerchantProfile
} from './types';
import { SEAFOOD_ITEMS, MARKET_INFO } from './data/seafoodData';
import { calculateDeliveryFee, estimateDeliveryMinutes, SHOP_LOCATION } from './utils/locationUtils';
import { Header } from './components/Header';
import { MarketHeroBanner } from './components/MarketHeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { SeafoodCard } from './components/SeafoodCard';
import { ItemCustomizeModal } from './components/ItemCustomizeModal';
import { FloatingCartBar } from './components/FloatingCartBar';
import { CartDrawer } from './components/CartDrawer';
import { PromptPayModal } from './components/PromptPayModal';
import { LiveTrackingView } from './components/LiveTrackingView';
import { RiderChatModal } from './components/RiderChatModal';
import { AddressModal } from './components/AddressModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { LineNotificationCenter } from './components/LineNotificationCenter';
import { LinePushBanner } from './components/LinePushBanner';
import { InAppCallModal } from './components/InAppCallModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MerchantDashboard } from './components/MerchantDashboard';
import { MerchantRegistrationModal } from './components/MerchantRegistrationModal';
import { AgentOrderModal } from './components/AgentOrderModal';
import { soundEngine } from './utils/audioUtils';

const DEFAULT_INITIAL_MERCHANT: MerchantProfile = {
  id: 'merchant-kao-kao',
  shopName: 'กุ้งเผาเผา 烤烤 (Kǎo Kǎo) 🔥🦞🦐 Seafood',
  ownerName: 'เชฟเก้า (Kǎo Kǎo Grill Master)',
  phone: '080-382-4909 / 096-328-6005',
  category: 'กุ้งเผาหัวมันแก้วกู๊กกกตัว & กุ้งขาวลวกจิ้มเนื้อหวาน',
  address: '31/225, 35 สุดซอยขวามือ บึงคำพร้อย ลำลูกกา ปทุมธานี (พฤกษาวิลเลจ1)',
  promptPayNumber: '0803824909',
  isOpen: true,
  avatarUrl: '/images/products/kaokao-logo.jpg',
  rating: 4.9,
  totalSales: 98500,
  registeredAt: 'ก.ย. 2024',
};

const INITIAL_LINE_NOTIFICATIONS: LineNotificationItem[] = [
  {
    id: 'notif-welcome',
    title: 'ยินดีต้อนรับสู่ กุ้งเผาเผา 烤烤 (Kǎo Kǎo)!',
    message: 'กุ้งเผาหัวมันแก้วกู๊กกกตัว ย่างด้วยดอกเกลือแท้ และกุ้งขาวลวกจิ้มเนื้อหวาน ส่งตรงจากพฤกษาวิลเลจ 1 ลำลูกกา ปทุมธานี โทร. 080-382-4909, 096-328-6005',
    timestamp: Date.now() - 1000 * 60 * 30,
    time: '30 นาทีที่แล้ว',
    read: false,
  },
  {
    id: 'notif-promo',
    title: 'คูปองพิเศษสำหรับคุณ: KAOKAO50',
    message: 'รับส่วนลด 50 บาท เมื่อสั่งกุ้งเผาเผา 烤烤 ครบ 400 บาท ใช้สิทธิ์ได้ทันทีในตะกร้า',
    timestamp: Date.now() - 1000 * 60 * 15,
    time: '15 นาทีที่แล้ว',
    read: false,
  }
];

export default function App() {
  // Local storage state keys (v4 for full Wongnai menu sync)
  const CART_STORAGE_KEY = 'flowfood_kaokao_cart_v4';
  const ORDERS_STORAGE_KEY = 'flowfood_kaokao_orders_v4';
  const ADDRESS_STORAGE_KEY = 'flowfood_kaokao_addr_v4';
  const DISTANCE_STORAGE_KEY = 'flowfood_kaokao_dist_v4';
  const NOTIFS_STORAGE_KEY = 'flowfood_kaokao_notifs_v4';
  const PRODUCTS_STORAGE_KEY = 'flowfood_kaokao_products_v4';
  const MERCHANT_STORAGE_KEY = 'flowfood_kaokao_merchant_v4';

  // Products State (Managed by Merchant, consumed by Customer)
  const [products, setProducts] = useState<SeafoodItem[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If saved products contain old unsplash images, refresh to SEAFOOD_ITEMS with Wongnai photos
        if (Array.isArray(parsed) && parsed.some((p: SeafoodItem) => p.imageUrl && p.imageUrl.includes('unsplash.com'))) {
          return SEAFOOD_ITEMS;
        }
        return parsed;
      }
      return SEAFOOD_ITEMS;
    } catch {
      return SEAFOOD_ITEMS;
    }
  });

  // Merchant Profile State
  const [merchant, setMerchant] = useState<MerchantProfile | null>(() => {
    try {
      const saved = localStorage.getItem(MERCHANT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_INITIAL_MERCHANT;
    } catch {
      return DEFAULT_INITIAL_MERCHANT;
    }
  });

  // View Mode: 'customer' (marketplace) or 'merchant' (management portal)
  const [viewMode, setViewMode] = useState<'customer' | 'merchant'>('customer');
  const [isMerchantRegistrationOpen, setIsMerchantRegistrationOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

  // Cart & Orders State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentAddress, setCurrentAddress] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(ADDRESS_STORAGE_KEY);
      return saved || 'หมู่บ้านพฤกษาวิลเลจ 1 (ซอย 35 สุดซอยขวามือ บึงคำพร้อย ลำลูกกา ปทุมธานี)';
    } catch {
      return 'หมู่บ้านพฤกษาวิลเลจ 1 (ซอย 35 สุดซอยขวามือ บึงคำพร้อย ลำลูกกา ปทุมธานี)';
    }
  });

  const [currentDistanceKm, setCurrentDistanceKm] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(DISTANCE_STORAGE_KEY);
      return saved ? parseFloat(saved) : 0.3;
    } catch {
      return 0.3;
    }
  });

  // LINE Notification System State
  const [lineNotifications, setLineNotifications] = useState<LineNotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(NOTIFS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_LINE_NOTIFICATIONS;
    } catch {
      return INITIAL_LINE_NOTIFICATIONS;
    }
  });
  const [isLineNotificationsOpen, setIsLineNotificationsOpen] = useState(false);
  const [activeLineBanner, setActiveLineBanner] = useState<LineNotificationItem | null>(null);

  // In-App Call Modal State
  const [callModalData, setCallModalData] = useState<{
    isOpen: boolean;
    targetType: 'rider' | 'restaurant';
  }>({
    isOpen: false,
    targetType: 'rider',
  });

  // Mobile navigation tab ('home' | 'tracking')
  const [mobileTab, setMobileTab] = useState<'home' | 'tracking'>('home');

  // UI state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customizingItem, setCustomizingItem] = useState<SeafoodItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isRiderChatOpen, setIsRiderChatOpen] = useState(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<PromoCoupon | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // PromptPay payment modal
  const [promptPayData, setPromptPayData] = useState<{
    isOpen: boolean;
    total: number;
    orderNumber: string;
    pendingOrder: Order | null;
  }>({
    isOpen: false,
    total: 0,
    orderNumber: '',
    pendingOrder: null,
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      if (merchant) {
        localStorage.setItem(MERCHANT_STORAGE_KEY, JSON.stringify(merchant));
      } else {
        localStorage.removeItem(MERCHANT_STORAGE_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [merchant]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(ADDRESS_STORAGE_KEY, currentAddress);
      localStorage.setItem(DISTANCE_STORAGE_KEY, currentDistanceKm.toString());
    } catch (e) {
      console.error(e);
    }
  }, [currentAddress, currentDistanceKm]);

  // Persist LINE notifications
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(lineNotifications));
    } catch (e) {
      console.error(e);
    }
  }, [lineNotifications]);

  // Find active ongoing order (if any)
  const activeOrder = useMemo(() => {
    if (activeTrackingOrderId) {
      return orders.find((o) => o.id === activeTrackingOrderId) || null;
    }
    // Or return the newest non-delivered order
    return orders.find((o) => o.status !== 'delivered') || null;
  }, [orders, activeTrackingOrderId]);

  // Unread LINE notifications count
  const unreadNotificationsCount = useMemo(() => {
    return lineNotifications.filter((n) => !n.read).length;
  }, [lineNotifications]);

  // Send realistic LINE Notification
  const sendLineNotification = useCallback((
    title: string,
    message: string,
    orderId?: string,
    orderStatus?: OrderStatus
  ) => {
    const newItem: LineNotificationItem = {
      id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      title,
      message,
      timestamp: Date.now(),
      time: 'เมื่อสักครู่',
      read: false,
      orderId,
      orderStatus,
    };

    setLineNotifications((prev) => [newItem, ...prev]);
    setActiveLineBanner(newItem);
    soundEngine.playLineChime();
  }, []);

  // Mark all LINE notifications as read
  const handleMarkAllNotificationsRead = () => {
    setLineNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setLineNotifications([]);
  };

  const handleOpenCall = (targetType: 'rider' | 'restaurant' = 'rider') => {
    setCallModalData({
      isOpen: true,
      targetType,
    });
  };

  // Total items and price in cart
  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.itemTotal, 0);
  }, [cartItems]);

  // Filter seafood items based on search and category from dynamic products state
  const filteredItems = useMemo(() => {
    return products.filter((item) => {
      const matchCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Add to cart handler
  const handleAddToCart = (item: SeafoodItem, options: CartItemOption, quantity: number) => {
    const basePrice = item.price;
    const weightExtra = options.weight.priceModifier;
    const cookingExtra = options.cooking.priceExtra;
    const sauceExtra = options.sauce.isExtraPrice || 0;
    const addOnsTotal = options.selectedAddOns.reduce((sum, a) => sum + a.price, 0);

    const unitPrice = basePrice + weightExtra + cookingExtra + sauceExtra + addOnsTotal;
    const itemTotal = unitPrice * quantity;

    const cartItemId = `${item.id}-${options.weight.id}-${options.cooking.id}-${options.sauce.id}-${options.spiciness}-${Date.now()}`;

    const newCartItem: CartItem = {
      cartItemId,
      item,
      options,
      quantity,
      unitPrice,
      itemTotal,
    };

    setCartItems((prev) => [...prev, newCartItem]);
    showToast(`เพิ่ม "${item.name}" ลงในตะกร้าแล้ว`);
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          return {
            ...item,
            quantity: newQty,
            itemTotal: item.unitPrice * newQty,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  // Merchant Actions
  const handleRegisterMerchantSuccess = (newMerchant: MerchantProfile) => {
    setMerchant(newMerchant);
    setIsMerchantRegistrationOpen(false);
    setViewMode('merchant');
    showToast(`ลงทะเบียนร้าน "${newMerchant.shopName}" สำเร็จ! ยินดีต้อนรับ`);

    sendLineNotification(
      '🎉 ยินดีต้อนรับร้านค้า FlowFood Partner',
      `ร้าน "${newMerchant.shopName}" เปิดร้านสำเร็จแล้ว สามารถเพิ่มเมนูและจัดการสต็อกได้ทันที`
    );
  };

  const handleUpdateProducts = (updatedProducts: SeafoodItem[]) => {
    setProducts(updatedProducts);
    showToast('บันทึกการแก้ไขรายการสินค้าเรียบร้อยแล้ว');
  };

  const handleUpdateMerchantProfile = (updatedProfile: MerchantProfile) => {
    setMerchant(updatedProfile);
    showToast('อัปเดตข้อมูลร้านค้าเรียบร้อยแล้ว');
  };

  const handleToggleShopOpen = () => {
    if (!merchant) return;
    const updated = {
      ...merchant,
      isOpen: !merchant.isOpen,
    };
    setMerchant(updated);
    showToast(updated.isOpen ? 'เปิดร้านรับออเดอร์เรียบร้อยแล้ว' : 'ปิดร้านชั่วคราวเรียบร้อยแล้ว');
  };

  // Checkout and Order Placement
  const handleCheckout = (
    paymentMethod: 'promptpay' | 'linepay' | 'credit' | 'cod',
    deliveryNotes: string,
    cutlery: boolean
  ) => {
    if (cartItems.length === 0) return;

    const subtotal = cartTotal;
    const rawDeliveryFee = calculateDeliveryFee(currentDistanceKm);
    let discount = 0;
    if (appliedCoupon && subtotal >= appliedCoupon.minSpend) {
      discount = appliedCoupon.discountAmount;
    }
    const deliveryFee = appliedCoupon?.code === 'FREESHIP' ? 0 : rawDeliveryFee;
    const total = Math.max(0, subtotal + deliveryFee - (appliedCoupon?.code === 'FREESHIP' ? 0 : discount));

    const orderNumber = `FF-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrderId = `order-${Date.now()}`;

    // Standard simulated FlowFood rider
    const mockRider: RiderInfo = {
      name: 'พี่สมชาย ไรเดอร์ Kǎo Kǎo',
      phone: '089-765-4321',
      plate: '1กข 8899 ปทุมธานี',
      bikeModel: 'Honda Wave 125i (กล่องโฟมเก็บความร้อน)',
      rating: 4.9,
      tripsCount: 1580,
      avatarUrl: '/images/products/kaokao-logo.jpg',
    };

    const newOrder: Order = {
      id: newOrderId,
      orderNumber,
      createdAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      status: 'confirmed',
      statusUpdatedAt: new Date().toISOString(),
      items: [...cartItems],
      subtotal,
      deliveryFee,
      discount,
      appliedPromo: appliedCoupon?.code,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'promptpay' ? 'pending' : 'paid',
      deliveryAddress: {
        recipientName: 'คุณวสันต์ (ลูกค้า FlowFood)',
        phone: '081-234-5678',
        addressText: currentAddress,
        details: deliveryNotes,
      },
      rider: mockRider,
      estimatedDeliveryMinutes: parseInt(estimateDeliveryMinutes(currentDistanceKm).replace(/[^0-9]/g, '')) || 25,
      cutlery,
      riderNote: deliveryNotes,
    };

    if (paymentMethod === 'promptpay') {
      // Open PromptPay Modal
      setPromptPayData({
        isOpen: true,
        total,
        orderNumber,
        pendingOrder: newOrder,
      });
      setIsCartOpen(false);
    } else {
      // Instant order confirmation for other payment methods
      setOrders((prev) => [newOrder, ...prev]);
      setCartItems([]);
      setAppliedCoupon(null);
      setIsCartOpen(false);
      setActiveTrackingOrderId(newOrderId);
      showToast(`สั่งซื้อสำเร็จ! ไรเดอร์กำลังเตรียมจัดส่งออเดอร์ #${orderNumber}`);

      // LINE Notification
      sendLineNotification(
        `🟢 ยืนยันออเดอร์ #${orderNumber} สำเร็จ`,
        `ตลาดทะเลสด FlowFood ได้รับคำสั่งซื้อ ${newOrder.items.length} รายการ (฿${total}) เรียบร้อยแล้ว กำลังเริ่มคัดกุ้ง-ปูสดลงเตา`,
        newOrderId,
        'confirmed'
      );
    }
  };

  // Payment success for PromptPay
  const handlePromptPaySuccess = () => {
    if (!promptPayData.pendingOrder) return;
    const confirmedOrder: Order = {
      ...promptPayData.pendingOrder,
      paymentStatus: 'paid',
    };

    setOrders((prev) => [confirmedOrder, ...prev]);
    setCartItems([]);
    setAppliedCoupon(null);
    setPromptPayData({ isOpen: false, total: 0, orderNumber: '', pendingOrder: null });
    setActiveTrackingOrderId(confirmedOrder.id);
    showToast(`ชำระเงินสำเร็จ! รับออเดอร์ #${confirmedOrder.orderNumber} แล้ว`);

    // LINE Notification
    sendLineNotification(
      `💳 ชำระเงินสำเร็จ #${confirmedOrder.orderNumber}`,
      `ยอดชำระ PromptPay ฿${confirmedOrder.total} ได้รับแล้ว ทางครัวเริ่มปรุงอาหารทันที`,
      confirmedOrder.id,
      'confirmed'
    );
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: newStatus,
            statusUpdatedAt: new Date().toISOString(),
          };
        }
        return o;
      })
    );

    // Send corresponding LINE alert
    const targetOrder = orders.find((o) => o.id === orderId);
    const orderNum = targetOrder ? targetOrder.orderNumber : '';

    if (newStatus === 'cooking') {
      sendLineNotification(
        `🔥 ทางร้านเริ่มปรุงอาหารสด #${orderNum}`,
        'กุ้งแม่น้ำลงเตาย่างถ่าน ปูม้านึ่งสมุนไพรกำลังสุกหอม น้ำจิ้มซีฟู้ดตำสดพร้อมแล้ว',
        orderId,
        'cooking'
      );
    } else if (newStatus === 'picking_up') {
      sendLineNotification(
        `🛵 ไรเดอร์กำลังไปรับ #${orderNum}`,
        `พี่${targetOrder?.rider.name || 'สมชาย'} ไรเดอร์ FlowFood กำลังตรวจนับและบรรจุลงกล่องโฟมเก็บความเย็น`,
        orderId,
        'picking_up'
      );
    } else if (newStatus === 'delivering') {
      sendLineNotification(
        `📍 ไรเดอร์กำลังมาส่ง #${orderNum}`,
        `อาหารทะเลสดกำลังมุ่งหน้าสู่ ${currentAddress} อีกประมาณ 10-15 นาทีถึงครับ สามารถโทรหาไรเดอร์ผ่านแอปได้ทันที`,
        orderId,
        'delivering'
      );
    } else if (newStatus === 'delivered') {
      sendLineNotification(
        `✅ จัดส่งอาหารสำเร็จ #${orderNum}`,
        'อาหารทะเลสดส่งถึงมือคุณเรียบร้อยแล้ว ขอให้อร่อยกับมื้อนี้นะครับ! ขอบคุณที่ไว้ใจ FlowFood Seafood',
        orderId,
        'delivered'
      );
    }
  };

  const handleReorder = (pastOrder: Order) => {
    setCartItems(pastOrder.items);
    setIsCartOpen(true);
    showToast(`เพิ่ม ${pastOrder.items.length} รายการจากออเดอร์เดิมลงในตะกร้าแล้ว`);
  };

  const handleUpdateOrderAddress = (orderId: string, newAddress: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            deliveryAddress: {
              ...o.deliveryAddress,
              addressText: newAddress,
            },
          };
        }
        return o;
      })
    );
    showToast(`อัปเดตที่อยู่จัดส่งออเดอร์เป็น "${newAddress}" แล้ว`);
    sendLineNotification(
      '📍 อัปเดตที่อยู่จัดส่งออเดอร์',
      `ลูกค้าได้อัปเดตที่อยู่จัดส่งใหม่: "${newAddress}" ไรเดอร์จะนำส่งตามพิกัดใหม่ทันที`,
      orderId
    );
  };

  const defaultRider: RiderInfo = useMemo(() => ({
    name: 'สมชาย บริการไว',
    phone: '089-765-4321',
    plate: '1กข 8899 กทม.',
    bikeModel: 'Honda Wave 125i (กล่องโฟมเขียว FlowFood)',
    rating: 4.9,
    tripsCount: 1580,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  }), []);

  // If in Merchant Dashboard View
  if (viewMode === 'merchant' && merchant) {
    return (
      <>
        {/* Real-time LINE Push Notification Banner */}
        <LinePushBanner
          notification={activeLineBanner}
          onDismiss={() => setActiveLineBanner(null)}
          onOpenCenter={() => {
            setActiveLineBanner(null);
            setIsLineNotificationsOpen(true);
          }}
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 backdrop-blur-xs border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <MerchantDashboard
          merchant={merchant}
          products={products}
          orders={orders}
          onUpdateProducts={handleUpdateProducts}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onBackToCustomerView={() => setViewMode('customer')}
          onUpdateMerchantProfile={handleUpdateMerchantProfile}
          onOpenCall={handleOpenCall}
        />

        {/* In-App VoIP Call Modal */}
        <InAppCallModal
          isOpen={callModalData.isOpen}
          onClose={() => setCallModalData((prev) => ({ ...prev, isOpen: false }))}
          rider={activeOrder?.rider || defaultRider}
          targetType={callModalData.targetType}
          orderNumber={activeOrder?.orderNumber}
        />

        {/* LINE Notification Center */}
        <LineNotificationCenter
          isOpen={isLineNotificationsOpen}
          onClose={() => setIsLineNotificationsOpen(false)}
          notifications={lineNotifications}
          onMarkAllRead={handleMarkAllNotificationsRead}
          onClearAll={handleClearNotifications}
          onSendTestNotification={() => {
            sendLineNotification(
              '🔔 ทดสอบการแจ้งเตือนร้านค้า FlowFood',
              'ระบบแจ้งเตือนร้านค้าพร้อมรับออเดอร์ใหม่จากลูกค้าเรียลไทม์'
            );
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-slate-900 flex flex-col pb-20 sm:pb-0">
      {/* Real-time LINE Push Notification Banner */}
      <LinePushBanner
        notification={activeLineBanner}
        onDismiss={() => setActiveLineBanner(null)}
        onOpenCenter={() => {
          setActiveLineBanner(null);
          setIsLineNotificationsOpen(true);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 backdrop-blur-xs border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentAddress={currentAddress}
        onOpenAddressModal={() => setIsAddressModalOpen(true)}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeOrder={activeOrder}
        onOpenTracking={() => {
          if (activeOrder) {
            setActiveTrackingOrderId(activeOrder.id);
            setMobileTab('tracking');
          }
        }}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenLineNotifications={() => setIsLineNotificationsOpen(true)}
        onOpenInAppCall={() => handleOpenCall('rider')}
        merchant={merchant}
        onOpenMerchantDashboard={() => setViewMode('merchant')}
        onOpenMerchantRegistration={() => setIsMerchantRegistrationOpen(true)}
        onOpenAgent={() => setIsAgentModalOpen(true)}
      />

      {/* View Switch: If user is actively in Live Tracking View or tracking tab */}
      {activeTrackingOrderId && activeOrder ? (
        <LiveTrackingView
          order={activeOrder}
          onBackToHome={() => {
            setActiveTrackingOrderId(null);
            setMobileTab('home');
          }}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onOpenRiderChat={() => setIsRiderChatOpen(true)}
          onOpenCall={handleOpenCall}
          onOpenLineNotifications={() => setIsLineNotificationsOpen(true)}
          onUpdateOrderAddress={handleUpdateOrderAddress}
        />
      ) : mobileTab === 'tracking' && !activeOrder ? (
        /* Empty Tracking State when mobile tab is selected but no active order */
        <main className="max-w-md mx-auto px-4 py-12 flex-1 w-full text-center">
          <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
            <Bike className="w-10 h-10" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">ไม่มีออเดอร์ที่กำลังจัดส่งขณะนี้</h2>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            สั่งกุ้งเผาเผาหัวมันแก้ว 100% ปูม้านึ่ง หรือหมึกย่างเตาถ่านวันนี้ ส่งด่วนถึงบ้านพร้อมระบบติดตามไรเดอร์แบบเรียลไทม์
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => setMobileTab('home')}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-sm shadow-md transition-colors cursor-pointer"
            >
              เลือกซื้อกุ้งเผาเผาหัวมันแก้ว & อาหารทะเล
            </button>
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold text-xs transition-colors cursor-pointer"
            >
              ดูประวัติคำสั่งซื้อเดิม
            </button>
          </div>
        </main>
      ) : (
        /* Main Seafood Marketplace View */
        <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 flex-1 w-full">
          {/* Merchant Quick Callout Bar */}
          <div className="mb-4 bg-gradient-to-r from-orange-950 via-amber-950 to-slate-950 text-white p-3.5 sm:p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 border border-orange-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs sm:text-sm">
                    {merchant ? `ร้านค้าพาร์ทเนอร์: ${merchant.shopName}` : 'เปิดร้านขายอาหารทะเลกับ FlowFood'}
                  </span>
                  <span className="bg-orange-500 text-white font-black text-[9px] px-1.5 py-0.2 rounded-md">
                    MERCHANT
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {merchant 
                    ? 'จัดการเมนูกุ้งเผาเผา 烤烤 ปรับราคา เช็คสต็อก และรับออเดอร์สดๆ'
                    : 'สมัครสมาชิกร้านค้าฟรี ไม่มีค่าแรกเข้า จัดการสินค้าและรับออเดอร์ทันที'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              {merchant ? (
                <button
                  type="button"
                  onClick={() => setViewMode('merchant')}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>เข้าสู่ระบบจัดการร้านค้า</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsMerchantRegistrationOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>สมัครเปิดร้านค้าทันที</span>
                </button>
              )}
            </div>
          </div>

          {/* Market Hero Banner */}
          <MarketHeroBanner
            onApplyCoupon={(coupon) => {
              setAppliedCoupon(coupon);
              showToast(`ใช้โค้ดส่วนลด "${coupon.code}" สำเร็จ!`);
            }}
            appliedCouponCode={appliedCoupon?.code}
            merchant={merchant}
            onToggleShopOpen={handleToggleShopOpen}
          />

          {/* AI Agent Order Assistant Quick Banner */}
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-orange-200/80 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    มีโหมดช่วยเหลือรับ Order ด้วย AI Agent 🦞
                  </h3>
                  <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    AI Assistant
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  ไม่แน่ใจว่าจะสั่งกี่ตัวดี? สอบถามระดับความเผ็ด แนะนำเซตกุ้งเผาหัวมันแก้ว หรือสั่งผ่านการพิมพ์คุยกับ Agent ได้ทันที
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAgentModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
            >
              <Bot className="w-4 h-4" />
              <span>เปิด Agent ช่วยรับออเดอร์</span>
            </button>
          </div>

          {/* Category Tabs */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Search Result Title / Filter info */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                {searchQuery
                  ? `ผลการค้นหา: "${searchQuery}" (${filteredItems.length} รายการ)`
                  : selectedCategory === 'all'
                  ? 'เมนูกุ้งเผาเผา & อาหารทะเลสดทั้งหมด'
                  : `หมวดหมู่: ${products.find((i) => i.category === selectedCategory)?.name || 'รายการอาหาร'}`}
              </h2>
              <p className="text-xs text-slate-500">
                กุ้งเผาเผาหัวมันแก้ว 100% ย่างเตาถ่านสดใหม่ พร้อมน้ำจิ้มซีฟู้ดมะนาวแท้
              </p>
            </div>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-orange-600 font-semibold hover:underline cursor-pointer"
              >
                ล้างการค้นหา
              </button>
            )}
          </div>

          {/* Seafood Dishes Grid */}
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-2xs my-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-3xl mx-auto mb-3">
                🔍
              </div>
              <h3 className="text-base font-bold text-slate-800">ไม่พบเมนูที่ค้นหา</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                ลองค้นหาด้วยคำอื่น เช่น กุ้งหัวมันแก้ว, ปูม้า, ปลากะพง หรือเลือกดูตามหมวดหมู่ด้านบน
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors cursor-pointer"
              >
                ดูเมนูทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 pb-20">
              {filteredItems.map((item) => {
                const cartQty = cartItems
                  .filter((c) => c.item.id === item.id)
                  .reduce((sum, c) => sum + c.quantity, 0);

                return (
                  <SeafoodCard
                    key={item.id}
                    item={item}
                    onSelectItem={setCustomizingItem}
                    cartQuantityForItem={cartQty}
                  />
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* Floating Bottom Cart Bar */}
      {!activeTrackingOrderId && (
        <FloatingCartBar
          totalItems={cartCount}
          totalPrice={cartTotal}
          onOpenCart={() => setIsCartOpen(true)}
        />
      )}

      {/* Floating AI Agent Assistant Button */}
      {!activeTrackingOrderId && viewMode === 'customer' && (
        <aside aria-label="AI Order Assistant">
          <button
            type="button"
            onClick={() => setIsAgentModalOpen(true)}
            className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-30 flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-700 hover:to-amber-600 text-white rounded-full shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:scale-105 active:scale-95 cursor-pointer border-2 border-white/40"
            title="ผู้ช่วย AI รับออเดอร์และแนะนำเมนูกุ้งเผาเผา 烤烤"
          >
            <div className="relative">
              <Bot className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
            </div>
            <div className="text-left hidden xs:block">
              <div className="text-[10px] text-amber-100 font-medium leading-none">ผู้ช่วยสั่งอาหาร</div>
              <div className="text-xs font-black leading-tight">Agent รับออเดอร์ AI</div>
            </div>
          </button>
        </aside>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={activeTrackingOrderId ? 'tracking' : mobileTab}
        onSelectTab={(tab) => {
          setMobileTab(tab);
          if (tab === 'tracking') {
            if (activeOrder) setActiveTrackingOrderId(activeOrder.id);
          } else {
            setActiveTrackingOrderId(null);
          }
        }}
        activeOrder={activeOrder}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenLineNotifications={() => setIsLineNotificationsOpen(true)}
        onOpenQuickCall={() => handleOpenCall(activeOrder ? 'rider' : 'restaurant')}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Merchant Registration Modal */}
      <MerchantRegistrationModal
        isOpen={isMerchantRegistrationOpen}
        onClose={() => setIsMerchantRegistrationOpen(false)}
        onRegisterSuccess={handleRegisterMerchantSuccess}
      />

      {/* Customization Drawer / Modal */}
      <ItemCustomizeModal
        item={customizingItem}
        onClose={() => setCustomizingItem(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        deliveryAddress={currentAddress}
        distanceKm={currentDistanceKm}
        onOpenAddressModal={() => setIsAddressModalOpen(true)}
        onUpdateDeliveryAddress={(newAddr) => {
          setCurrentAddress(newAddr);
          showToast(`อัปเดตที่อยู่จัดส่งเรียบร้อยแล้ว: "${newAddr}"`);
        }}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={setAppliedCoupon}
        onCheckout={handleCheckout}
        isStoreOpen={merchant?.isOpen ?? true}
      />

      {/* PromptPay QR Code Modal */}
      <PromptPayModal
        isOpen={promptPayData.isOpen}
        onClose={() =>
          setPromptPayData({ isOpen: false, total: 0, orderNumber: '', pendingOrder: null })
        }
        totalAmount={promptPayData.total}
        orderNumber={promptPayData.orderNumber}
        onPaymentSuccess={handlePromptPaySuccess}
      />

      {/* Rider In-App Chat Modal */}
      {activeOrder && (
        <RiderChatModal
          isOpen={isRiderChatOpen}
          onClose={() => setIsRiderChatOpen(false)}
          rider={activeOrder.rider}
          onOpenCall={() => handleOpenCall('rider')}
        />
      )}

      {/* In-App VoIP Call Modal */}
      <InAppCallModal
        isOpen={callModalData.isOpen}
        onClose={() => setCallModalData((prev) => ({ ...prev, isOpen: false }))}
        rider={activeOrder?.rider || defaultRider}
        targetType={callModalData.targetType}
        orderNumber={activeOrder?.orderNumber}
      />

      {/* LINE Official Account Notification Feed Modal */}
      <LineNotificationCenter
        isOpen={isLineNotificationsOpen}
        onClose={() => setIsLineNotificationsOpen(false)}
        notifications={lineNotifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onClearAll={handleClearNotifications}
        onSelectOrder={(orderId) => {
          setActiveTrackingOrderId(orderId);
          setMobileTab('tracking');
        }}
        onSendTestNotification={() => {
          sendLineNotification(
            '🔔 ทดสอบการแจ้งเตือน FlowFood Seafood',
            'ระบบแจ้งเตือนผ่าน LINE Official Account ทำงานปกติ มีเสียง Chime พร้อมข้อความแจ้งเตือนอัตโนมัติ'
          );
        }}
      />

      {/* Address Selection Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        currentAddress={currentAddress}
        currentDistanceKm={currentDistanceKm}
        onSaveAddress={(newAddr, distKm) => {
          setCurrentAddress(newAddr);
          if (distKm !== undefined) {
            setCurrentDistanceKm(distKm);
          }
          showToast(`อัปเดตสถานที่จัดส่งเรียบร้อยแล้ว${distKm !== undefined ? ` (ระยะทาง ${distKm} กม.)` : ''}`);
        }}
      />

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        orders={orders}
        onSelectOrder={(ord) => {
          setActiveTrackingOrderId(ord.id);
          setMobileTab('tracking');
        }}
        onReorder={handleReorder}
      />

      {/* AI Agent Order Assistant Modal */}
      <AgentOrderModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        products={products}
        cartItems={cartItems}
        onAddToCart={handleAddToCart}
        onOpenCart={() => {
          setIsAgentModalOpen(false);
          setIsCartOpen(true);
        }}
        currentAddress={currentAddress}
        distanceKm={currentDistanceKm}
        merchant={merchant}
        onOpenAddressModal={() => setIsAddressModalOpen(true)}
      />
    </div>
  );
}
