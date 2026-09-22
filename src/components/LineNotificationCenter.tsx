import { useState } from 'react';
import { 
  X, 
  Bell, 
  Check, 
  MessageCircle, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Send
} from 'lucide-react';
import { LineNotificationItem } from '../types';
import { soundEngine } from '../utils/audioUtils';

interface LineNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: LineNotificationItem[];
  onClearNotifications?: () => void;
  onClearAll?: () => void;
  onMarkAllRead?: () => void;
  onSendTestNotification: () => void;
  isLineEnabled?: boolean;
  onToggleLineEnabled?: (enabled: boolean) => void;
  onSelectOrder?: (orderId: string) => void;
  onSelectOrderNumber?: (orderNumber: string) => void;
}

export function LineNotificationCenter({
  isOpen,
  onClose,
  notifications,
  onClearNotifications,
  onClearAll,
  onMarkAllRead,
  onSendTestNotification,
  isLineEnabled = true,
  onToggleLineEnabled,
  onSelectOrder,
  onSelectOrderNumber,
}: LineNotificationCenterProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const handleClear = onClearAll || onClearNotifications || (() => {});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl h-[88vh] sm:h-[620px] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Signature LINE Green Theme */}
        <div className="p-4 bg-[#06C755] text-white flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#06C755] font-black text-xl shadow-xs">
              <MessageCircle className="w-6 h-6 fill-[#06C755]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-base leading-tight">
                <span>LINE Notification</span>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">
                  Official Account
                </span>
              </div>
              <p className="text-xs text-white/90">แจ้งเตือนสถานะอาหารทะเลสดถึง LINE คุณแบบเรียลไทม์</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LINE Integration Status Card */}
        <div className="p-3.5 bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                LINE
              </div>
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white absolute bottom-0 right-0 ring-1 ring-emerald-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <span>เชื่อมต่อ LINE OA: @kaokao_seafood</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                  พร้อมใช้งาน
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                รับข้อความเตือนเมื่อร้านรับออเดอร์, กุ้งเริ่มเผา, และไรเดอร์ออกเดินทาง
              </div>
            </div>
          </div>

          {/* Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input 
              type="checkbox" 
              checked={isLineEnabled} 
              onChange={(e) => onToggleLineEnabled?.(e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#06C755]"></div>
          </label>
        </div>

        {/* Action Bar for testing and sound */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs shrink-0">
          <button
            type="button"
            onClick={onSendTestNotification}
            className="flex items-center gap-1 text-[11px] font-bold text-[#06C755] hover:text-emerald-700 bg-emerald-100/60 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>ทดสอบส่งแจ้งเตือนเข้า LINE</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) soundEngine.playLineChime();
              }}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span>{soundEnabled ? 'เปิดเสียงเตือน' : 'ปิดเสียง'}</span>
            </button>

            {onMarkAllRead && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-[11px] text-emerald-700 hover:underline transition-colors"
              >
                อ่านทั้งหมด
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
              >
                ล้างประวัติ
              </button>
            )}
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F0F2F5]">
          {notifications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-white text-slate-300 flex items-center justify-center mx-auto mb-3 text-3xl shadow-sm">
                💬
              </div>
              <h4 className="text-sm font-bold text-slate-700">ยังไม่มีการแจ้งเตือนผ่าน LINE</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                เมื่อสั่งอาหารทะเลสด ระบบจะส่งข้อความแจ้งเตือนสถานะปรุงสดและไรเดอร์เข้ามาที่นี่ทันที
              </p>
              <button
                onClick={onSendTestNotification}
                className="mt-4 px-4 py-2 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                ลองส่งแจ้งเตือนทดสอบ
              </button>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#06C755] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      LINE
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900">{notif.title}</span>
                        {notif.orderNumber && (
                          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                            #{notif.orderNumber}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{notif.time}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    ส่งถึง LINE แล้ว
                  </span>
                </div>

                {/* Message body styled like LINE Chat bubble */}
                <div className="mt-2.5 p-3 bg-[#E8F8EE] rounded-xl text-xs text-slate-800 leading-relaxed border border-emerald-100/60">
                  {notif.message}
                </div>

                {(notif.orderId || notif.orderNumber) && (onSelectOrder || onSelectOrderNumber) && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (notif.orderId && onSelectOrder) {
                          onSelectOrder(notif.orderId);
                        } else if (notif.orderNumber && onSelectOrderNumber) {
                          onSelectOrderNumber(notif.orderNumber);
                        }
                        onClose();
                      }}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>ติดตามออเดอร์นี้</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
