import { X, Clock, ChevronRight, Bike, CheckCircle2, RotateCw } from 'lucide-react';
import { Order } from '../types';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onReorder: (order: Order) => void;
}

export function OrderHistoryModal({
  isOpen,
  onClose,
  orders,
  onSelectOrder,
  onReorder,
}: OrderHistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl p-5 max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-50 text-orange-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-tight">
                ประวัติการสั่งซื้ออาหารทะเล
              </h3>
              <p className="text-[11px] text-slate-400">ออเดอร์ทั้งหมดของคุณ ({orders.length})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2 text-2xl">
                📋
              </div>
              <p className="text-xs text-slate-500 font-medium">ยังไม่มีประวัติการสั่งซื้อ</p>
              <p className="text-[11px] text-slate-400">เมื่อสั่งซื้ออาหารทะเล ออเดอร์จะแสดงที่นี่</p>
            </div>
          ) : (
            orders.map((ord) => {
              const totalItems = ord.items.reduce((s, i) => s + i.quantity, 0);
              const isDelivered = ord.status === 'delivered';

              return (
                <div
                  key={ord.id}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-orange-300 transition-all shadow-2xs hover:shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        #{ord.orderNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">{ord.createdAt}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isDelivered
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-orange-100 text-orange-800 animate-pulse'
                      }`}
                    >
                      {isDelivered ? '✓ จัดส่งสำเร็จ' : '🛵 กำลังจัดส่ง'}
                    </span>
                  </div>

                  {/* Summary of items */}
                  <div className="text-xs text-slate-600 font-medium line-clamp-1">
                    {ord.items.map((i) => `${i.item.name} (${i.quantity}x)`).join(', ')}
                  </div>

                  {/* Footer with total and actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">
                        {totalItems} รายการ • รวม
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        ฿{ord.total.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectOrder(ord);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>{isDelivered ? 'ดูใบเสร็จ' : 'ติดตามสถานะ'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onReorder(ord);
                          onClose();
                        }}
                        className="p-1.5 text-slate-500 hover:text-orange-700 hover:bg-slate-100 rounded-xl transition-colors"
                        title="สั่งซ้ำอีกครั้ง"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
