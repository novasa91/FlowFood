// Location & Coordinates Utility for กุ้งเผาเผา 烤烤 (Kǎo Kǎo) Seafood
// Origin address: 31/225, 35 สุดซอยขวามือ บึงคำพร้อย ลำลูกกา ปทุมธานี (พฤกษาวิลเลจ1)

export const SHOP_LOCATION = {
  name: 'กุ้งเผาเผา 烤烤 (Kǎo Kǎo) 🔥🦞🦐 Seafood',
  address: '31/225, 35 สุดซอยขวามือ บึงคำพร้อย ลำลูกกา ปทุมธานี (พฤกษาวิลเลจ1)',
  subdistrict: 'บึงคำพร้อย',
  district: 'ลำลูกกา',
  province: 'ปทุมธานี',
  postalCode: '12150',
  phones: ['080-382-4909', '096-328-6005'],
  phonePrimary: '080-382-4909',
  phoneSecondary: '096-328-6005',
  lat: 13.9382,
  lng: 100.7185,
  wongnaiUrl: 'https://www.wongnai.com/restaurants/3269120ke-%E0%B8%81%E0%B8%B8%E0%B9%89%E0%B8%87%E0%B9%80%E0%B8%9C%E0%B8%B2%E0%B9%80%E0%B8%9C%E0%B8%B2-%E7%83%A4%E7%83%A4-k%C7%8Eo-k%C7%8Eo-seafood',
};

export interface DeliveryPoint {
  id: string;
  title: string;
  details: string;
  lat: number;
  lng: number;
  iconType: 'home' | 'building' | 'work';
  tag: string;
}

// Preset delivery locations centered in Lam Luk Ka / Pathum Thani around the shop
export const PRESET_DELIVERY_LOCATIONS: DeliveryPoint[] = [
  {
    id: 'loc-pruksa1',
    title: 'หมู่บ้านพฤกษาวิลเลจ 1 (ซอย 35 สุดซอยขวามือ)',
    details: 'ซอย 35 ต.บึงคำพร้อย อ.ลำลูกกา จ.ปทุมธานี (โซนเดียวกับครัว)',
    lat: 13.9385,
    lng: 100.7187,
    iconType: 'home',
    tag: 'พฤกษาวิลเลจ 1',
  },
  {
    id: 'loc-klong5',
    title: 'ถนนเลียบคลอง 5 ลำลูกกา ปทุมธานี',
    details: 'ใกล้ อบต.บึงคำพร้อย ถ.เลียบคลอง 5 อ.ลำลูกกา จ.ปทุมธานี',
    lat: 13.9480,
    lng: 100.7220,
    iconType: 'home',
    tag: 'บึงคำพร้อย คลอง 5',
  },
  {
    id: 'loc-ac-market',
    title: 'ตลาดเอซี ลำลูกกา คลอง 4',
    details: 'ต.ลาดสวาย อ.ลำลูกกา จ.ปทุมธานี 12150',
    lat: 13.9420,
    lng: 100.6860,
    iconType: 'work',
    tag: 'คลอง 4 ลำลูกกา',
  },
  {
    id: 'loc-warabordeen',
    title: 'หมู่บ้านวราบดินทร์ ลำลูกกา วงแหวน-คลอง 5',
    details: 'ถ.ลำลูกกา ต.บึงคำพร้อย อ.ลำลูกกา จ.ปทุมธานี',
    lat: 13.9310,
    lng: 100.7290,
    iconType: 'building',
    tag: 'วงแหวน ลำลูกกา',
  },
  {
    id: 'loc-wongsakorn',
    title: 'สายไหม - ตลาดวงศกร',
    details: 'ถ.สุขาภิบาล 5 แขวงสายไหม เขตสายไหม กรุงเทพมหานคร',
    lat: 13.9180,
    lng: 100.6900,
    iconType: 'building',
    tag: 'สายไหม-วงศกร',
  },
  {
    id: 'loc-future-rangsit',
    title: 'ฟิวเจอร์พาร์ค รังสิต / โซนรังสิต-ปทุมธานี',
    details: 'ถ.พหลโยธิน ต.ประชาธิปัตย์ อ.ธัญบุรี จ.ปทุมธานี 12130',
    lat: 13.9890,
    lng: 100.6175,
    iconType: 'building',
    tag: 'รังสิต-ปทุมธานี',
  },
];

/**
 * Calculates Haversine distance in kilometers from the restaurant's GPS coordinates
 * Shop: (13.9382, 100.7185) at พฤกษาวิลเลจ 1 บึงคำพร้อย ลำลูกกา ปทุมธานี
 */
export function calculateDistanceFromShop(targetLat: number, targetLng: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (targetLat - SHOP_LOCATION.lat) * (Math.PI / 180);
  const dLon = (targetLng - SHOP_LOCATION.lng) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(SHOP_LOCATION.lat * (Math.PI / 180)) *
    Math.cos(targetLat * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Calculate delivery fee based on real distance from the shop
 */
export function calculateDeliveryFee(distanceKm: number): number {
  if (distanceKm <= 0.5) return 0; // Same village = Free delivery!
  if (distanceKm <= 2.0) return 20;
  if (distanceKm <= 4.0) return 30;
  if (distanceKm <= 7.0) return 40;
  if (distanceKm <= 12.0) return 55;
  return Math.min(100, Math.round(55 + (distanceKm - 12) * 5));
}

/**
 * Estimate delivery duration in minutes based on distance
 */
export function estimateDeliveryMinutes(distanceKm: number): string {
  if (distanceKm <= 0.5) return '10-15 นาที';
  if (distanceKm <= 2.0) return '15-25 นาที';
  if (distanceKm <= 5.0) return '25-35 นาที';
  if (distanceKm <= 10.0) return '35-45 นาที';
  return '45-60 นาที';
}
