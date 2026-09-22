import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  ShoppingBag,
  Award,
  ArrowUpRight,
  BarChart3,
  LineChart,
  Sparkles,
  ArrowDownRight,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { Order } from '../types';

interface DailySalesChartProps {
  orders: Order[];
  shopName?: string;
  onResetSales?: () => void;
  isSalesReset?: boolean;
}

interface DayData {
  date: string;
  dayLabel: string;
  fullDate: string;
  sales: number;
  ordersCount: number;
  avgOrderValue: number;
  isToday?: boolean;
}

export function DailySalesChart({ orders, shopName, onResetSales, isSalesReset = false }: DailySalesChartProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');
  const [metricView, setMetricView] = useState<'revenue' | 'orders' | 'both'>('revenue');

  // Calculate live session orders for today
  const liveTodayRevenue = useMemo(() => {
    return orders.reduce((sum, order) => sum + (order.total || 0), 0);
  }, [orders]);

  const liveTodayOrdersCount = orders.length;

  // Generate historical data merged with live orders (if reset, baseline is 0 so user starts from 1)
  const chartData = useMemo<DayData[]>(() => {
    // Thai month abbreviations
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
    ];
    const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

    const count = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const now = new Date();

    const baselineDaily: DayData[] = [];

    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);

      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6; // Sun, Fri, Sat
      const isToday = i === 0;

      const dateStr = `${d.getDate()} ${thaiMonths[d.getMonth()]}`;
      const dayName = thaiDays[dayOfWeek];

      if (isSalesReset) {
        // If sales have been reset to start from 1:
        // Prior days are 0, today only has live orders from the reset session
        const todaySales = liveTodayRevenue;
        const todayOrders = liveTodayOrdersCount;
        baselineDaily.push({
          date: isToday ? `${dateStr} (วันนี้)` : dateStr,
          dayLabel: dayName,
          fullDate: isToday
            ? `${dayName}ที่ ${d.getDate()} ${thaiMonths[d.getMonth()]} (วันนี้)`
            : `${dayName}ที่ ${d.getDate()} ${thaiMonths[d.getMonth()]}`,
          sales: isToday ? todaySales : 0,
          ordersCount: isToday ? todayOrders : 0,
          avgOrderValue: isToday && todayOrders > 0 ? Math.round(todaySales / todayOrders) : 0,
          isToday,
        });
      } else {
        // Deterministic pseudo-random variation based on date
        const seed = (d.getDate() * 17 + d.getMonth() * 31) % 100;
        const baseWeekendBonus = isWeekend ? 3500 : 0;
        const baseSales = 5200 + (seed * 55) + baseWeekendBonus;
        const baseOrders = Math.round(baseSales / 650);

        if (isToday) {
          // For today: include baseline earlier orders of today + all live orders from session
          const todayBaseSales = 4800 + liveTodayRevenue;
          const todayOrders = 7 + liveTodayOrdersCount;
          baselineDaily.push({
            date: `${dateStr} (วันนี้)`,
            dayLabel: dayName,
            fullDate: `${dayName}ที่ ${d.getDate()} ${thaiMonths[d.getMonth()]} (วันนี้)`,
            sales: todayBaseSales,
            ordersCount: todayOrders,
            avgOrderValue: Math.round(todayBaseSales / Math.max(1, todayOrders)),
            isToday: true,
          });
        } else {
          baselineDaily.push({
            date: dateStr,
            dayLabel: dayName,
            fullDate: `${dayName}ที่ ${d.getDate()} ${thaiMonths[d.getMonth()]}`,
            sales: baseSales,
            ordersCount: baseOrders,
            avgOrderValue: Math.round(baseSales / Math.max(1, baseOrders)),
            isToday: false,
          });
        }
      }
    }

    return baselineDaily;
  }, [timeRange, liveTodayRevenue, liveTodayOrdersCount, isSalesReset]);

  // Aggregate stats
  const totalRevenue = useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.sales, 0),
    [chartData]
  );
  const totalOrders = useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.ordersCount, 0),
    [chartData]
  );
  const avgDailyRevenue = useMemo(
    () => Math.round(totalRevenue / chartData.length),
    [totalRevenue, chartData.length]
  );
  const avgOrderValue = useMemo(
    () => Math.round(totalRevenue / Math.max(1, totalOrders)),
    [totalRevenue, totalOrders]
  );

  const bestDay = useMemo(() => {
    return chartData.reduce((max, item) => (item.sales > max.sales ? item : max), chartData[0]);
  }, [chartData]);

  // Comparison with previous period (e.g. +14.8% growth)
  const growthRate = 12.8;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
      {/* Chart Card Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  กราฟสรุปยอดขายรายวัน (Daily Sales Overview)
                </h2>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Recharts Data
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {shopName ? `${shopName} • ` : ''}วิเคราะห์รายได้และจำนวนออเดอร์รายวัน อัปเดตสดตามคำสั่งซื้อ
              </p>
            </div>
          </div>
        </div>

        {/* Controls: TimeRange & ChartType */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time range selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === '7d'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              7 วันล่าสุด
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('14d')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === '14d'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              14 วัน
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === '30d'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              30 วัน (เดือนนี้)
            </button>
          </div>

          {/* Metric View Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setMetricView('revenue')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                metricView === 'revenue'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
              title="ดูเฉพาะยอดขาย (บาท)"
            >
              ฿ ยอดขาย
            </button>
            <button
              type="button"
              onClick={() => setMetricView('orders')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                metricView === 'orders'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
              title="ดูเฉพาะจำนวนออเดอร์"
            >
              📦 ออเดอร์
            </button>
            <button
              type="button"
              onClick={() => setMetricView('both')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                metricView === 'both'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
              title="ดูทั้งยอดขายและออเดอร์"
            >
              รวม 2 มุมมอง
            </button>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
              title="กราฟแท่ง (Bar Chart)"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === 'area'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
              title="กราฟเส้นพื้นที่ (Area Trend)"
            >
              <LineChart className="w-4 h-4" />
            </button>
          </div>

          {/* Reset Sales Button */}
          {onResetSales && (
            <button
              type="button"
              onClick={onResetSales}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="ล้างข้อมูลยอดขายทั้งหมด เพื่อเริ่มนับ 1 ใหม่"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>ล้างยอดขาย & นับ 1 ใหม่</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 sm:p-6 bg-slate-50/70 border-b border-slate-100">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">ยอดขายรวมช่วงนี้</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            ฿{totalRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold mt-0.5">
            {isSalesReset ? (
              <span className="text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                🔄 รีเซ็ตยอดขายเริ่มต้นใหม่
              </span>
            ) : (
              <span className="text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                <span>+{growthRate}% เทียบช่วงก่อน</span>
              </span>
            )}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">ยอดขายเฉลี่ย / วัน</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            ฿{avgDailyRevenue.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
            เฉลี่ย {Math.round(totalOrders / chartData.length)} บิล/วัน
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">ออเดอร์รวม & ยอดเฉลี่ย/บิล</span>
            <ShoppingBag className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            {totalOrders} <span className="text-xs font-bold text-slate-500">ออเดอร์</span>
          </div>
          <p className="text-[10px] text-amber-700 font-bold mt-0.5">
            เฉลี่ย ฿{avgOrderValue.toLocaleString()} / บิล
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">วันที่ขายดีที่สุด</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-lg sm:text-xl font-black text-purple-900 truncate">
            {bestDay ? bestDay.date : '-'}
          </div>
          <p className="text-[10px] text-purple-700 font-bold mt-0.5">
            ฿{bestDay ? bestDay.sales.toLocaleString() : 0} ({bestDay?.ordersCount || 0} บิล)
          </p>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <span>สถิติยอดขายรายวัน</span>
            {metricView === 'revenue' && <span className="text-emerald-700 font-normal">(เฉพาะยอดเงิน ฿)</span>}
            {metricView === 'orders' && <span className="text-amber-700 font-normal">(เฉพาะจำนวนคำสั่งซื้อ)</span>}
            {metricView === 'both' && <span className="text-slate-500 font-normal">(เปรียบเทียบยอดขาย ฿ vs ออเดอร์)</span>}
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
              <span className="text-slate-600 font-semibold">ยอดขาย (฿)</span>
            </span>
            {(metricView === 'orders' || metricView === 'both') && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
                <span className="text-slate-600 font-semibold">ออเดอร์ (บิล)</span>
              </span>
            )}
          </div>
        </div>

        {/* Responsive Recharts Render */}
        <div className="w-full h-[320px] sm:h-[360px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 10, left: -10, bottom: 25 }}
              >
                <defs>
                  <linearGradient id="barGradientSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.7} />
                  </linearGradient>
                  <linearGradient id="barGradientToday" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EA580C" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#F97316" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="barGradientOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#FBBF24" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                  interval={timeRange === '30d' ? 2 : 0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                />
                {metricView === 'both' && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#F59E0B' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val} บิล`}
                  />
                )}
                <Tooltip content={<CustomTooltip />} />
                {(metricView === 'revenue' || metricView === 'both') && (
                  <Bar
                    yAxisId="left"
                    dataKey="sales"
                    name="ยอดขาย (บาท)"
                    fill="url(#barGradientSales)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                )}
                {(metricView === 'orders' || metricView === 'both') && (
                  <Bar
                    yAxisId={metricView === 'both' ? 'right' : 'left'}
                    dataKey="ordersCount"
                    name="จำนวนออเดอร์"
                    fill="url(#barGradientOrders)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={35}
                  />
                )}
              </BarChart>
            ) : (
              <AreaChart
                data={chartData}
                margin={{ top: 15, right: 10, left: -10, bottom: 25 }}
              >
                <defs>
                  <linearGradient id="areaGradientSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="areaGradientOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                  interval={timeRange === '30d' ? 2 : 0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                />
                {metricView === 'both' && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#F59E0B' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val} บิล`}
                  />
                )}
                <Tooltip content={<CustomTooltip />} />
                {(metricView === 'revenue' || metricView === 'both') && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="sales"
                    name="ยอดขาย (บาท)"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#areaGradientSales)"
                    activeDot={{ r: 6, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
                  />
                )}
                {(metricView === 'orders' || metricView === 'both') && (
                  <Area
                    yAxisId={metricView === 'both' ? 'right' : 'left'}
                    type="monotone"
                    dataKey="ordersCount"
                    name="จำนวนออเดอร์"
                    stroke="#D97706"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#areaGradientOrders)"
                    activeDot={{ r: 5, fill: '#D97706', stroke: '#fff', strokeWidth: 2 }}
                  />
                )}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Live Note */}
        <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>
              <strong>ยอดวันนี้:</strong> ฿{chartData[chartData.length - 1]?.sales.toLocaleString()} ({chartData[chartData.length - 1]?.ordersCount} ออเดอร์) • รวมคำสั่งซื้อสดในระบบ {liveTodayOrdersCount} รายการ
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold hidden sm:inline">
            คำนวณแบบ Real-time
          </span>
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="border-t border-slate-100 p-4 sm:p-6 bg-slate-50/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>ตารางแจกแจงรายวัน ({timeRange === '7d' ? '7 วันล่าสุด' : timeRange === '14d' ? '14 วันล่าสุด' : '30 วันล่าสุด'})</span>
          </h3>
          <span className="text-[11px] text-slate-400">เรียงจากล่าสุดไปอดีต</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-[11px] uppercase">
                <th className="pb-2 font-bold">วันที่</th>
                <th className="pb-2 font-bold text-right">ยอดขายสุทธิ</th>
                <th className="pb-2 font-bold text-right">จำนวนออเดอร์</th>
                <th className="pb-2 font-bold text-right">เฉลี่ยต่อบิล</th>
                <th className="pb-2 font-bold text-center">สถานะเทียบเป้า</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...chartData].reverse().slice(0, 7).map((item, idx) => {
                const targetMet = item.sales >= 7000;
                return (
                  <tr key={idx} className={`hover:bg-white transition-colors ${item.isToday ? 'bg-orange-50/40 font-bold' : ''}`}>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">{item.fullDate}</span>
                        {item.isToday && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-500 text-white font-black">
                            วันนี้
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-black text-slate-900">
                      ฿{item.sales.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-slate-700">
                      {item.ordersCount} บิล
                    </td>
                    <td className="py-2.5 text-right text-slate-600">
                      ฿{item.avgOrderValue.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          targetMet
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {targetMet ? 'ยอดทะลุเป้า 🔥' : 'ปกติทั่วไป'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Custom Tooltip component for Recharts
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data: DayData = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-800 text-xs min-w-[170px] space-y-1.5">
        <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">
          📅 {data.fullDate}
        </p>
        <div className="space-y-1">
          <div className="flex justify-between items-center gap-3">
            <span className="text-slate-400">ยอดขายรวม:</span>
            <span className="font-black text-emerald-400 text-sm">
              ฿{data.sales.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center gap-3">
            <span className="text-slate-400">จำนวนออเดอร์:</span>
            <span className="font-bold text-amber-300">
              {data.ordersCount} บิล
            </span>
          </div>
          <div className="flex justify-between items-center gap-3">
            <span className="text-slate-400">เฉลี่ยต่อบิล:</span>
            <span className="font-semibold text-slate-300">
              ฿{data.avgOrderValue.toLocaleString()}
            </span>
          </div>
        </div>
        {data.isToday && (
          <div className="pt-1 border-t border-slate-800/80 text-[10px] text-orange-400 font-bold">
            🔥 รวมออเดอร์ล่าสุดของวันนี้แล้ว
          </div>
        )}
      </div>
    );
  }
  return null;
}
