export interface WeightOption {
  id: string;
  name: string;
  weightGrams?: number;
  priceModifier: number; // additional or base price
  isDefault?: boolean;
}

export interface CookingOption {
  id: string;
  name: string;
  description: string;
  priceExtra: number;
}

export interface SauceOption {
  id: string;
  name: string;
  description: string;
  isExtraPrice?: number;
}

export type SpicinessLevel = 'เผ็ดน้อย (Mild)' | 'เผ็ดปานกลาง (Medium)' | 'เผ็ดแซ่บจี๊ด (Very Spicy)' | 'ไม่เผ็ด (No Chili)';

export interface SeafoodItem {
  id: string;
  name: string;
  nameEn: string;
  category: 'all' | 'shrimp' | 'sauce' | 'crab' | 'fish' | 'shellfish' | 'ready_to_eat' | 'sets' | 'recommend' | string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  description: string;
  freshnessSource: string; // e.g. "เรือประมงบางแสน วันต่อวัน"
  prepTimeMinutes: number;
  badge?: string;
  rating: number;
  reviewCount: number;
  weightOptions: WeightOption[];
  cookingOptions: CookingOption[];
  sauceOptions: SauceOption[];
  availableAddOns?: { id: string; name: string; price: number }[];
  isPopular?: boolean;
  inStock: boolean;
}

export interface CartItemOption {
  weight: WeightOption;
  cooking: CookingOption;
  sauce: SauceOption;
  spiciness: SpicinessLevel;
  selectedAddOns: { id: string; name: string; price: number }[];
  specialInstructions?: string;
}

export interface CartItem {
  cartItemId: string;
  item: SeafoodItem;
  options: CartItemOption;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
}

export type OrderStatus = 'confirmed' | 'cooking' | 'picking_up' | 'delivering' | 'delivered';

export interface RiderInfo {
  name: string;
  phone: string;
  plate: string;
  bikeModel: string;
  rating: number;
  tripsCount: number;
  avatarUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  statusUpdatedAt: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  appliedPromo?: string;
  total: number;
  paymentMethod: 'promptpay' | 'linepay' | 'credit' | 'cod';
  paymentStatus: 'paid' | 'pending';
  deliveryAddress: {
    recipientName: string;
    phone: string;
    addressText: string;
    details: string; // e.g. "ห้อง 1205 ชั้น 12 ฝากนิติ"
  };
  rider: RiderInfo;
  estimatedDeliveryMinutes: number;
  cutlery: boolean;
  riderNote?: string;
}

export interface PromoCoupon {
  code: string;
  title: string;
  description: string;
  discountAmount: number;
  minSpend: number;
  badge: string;
}

export interface LineNotificationItem {
  id: string;
  orderNumber?: string;
  orderId?: string;
  title: string;
  message: string;
  time: string;
  timestamp?: number;
  status?: OrderStatus | 'alert';
  orderStatus?: OrderStatus;
  read: boolean;
  type?: 'order' | 'rider' | 'promo' | 'system';
}

export interface MerchantProfile {
  id: string;
  shopName: string;
  ownerName: string;
  phone: string;
  email?: string;
  category: string;
  address: string;
  promptPayNumber: string;
  isOpen: boolean;
  avatarUrl: string;
  coverUrl?: string;
  rating: number;
  totalSales: number;
  registeredAt: string;
}
