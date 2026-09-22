import { useEffect } from 'react';
import { MessageCircle, X, ChevronRight } from 'lucide-react';
import { LineNotificationItem } from '../types';

interface LinePushBannerProps {
  notification: LineNotificationItem | null;
  onDismiss: () => void;
  onOpenCenter: () => void;
}

export function LinePushBanner({
  notification,
  onDismiss,
  onOpenCenter,
}: LinePushBannerProps) {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000); // auto-hide after 6 seconds

    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div className="fixed top-2 sm:top-4 inset-x-2 sm:inset-x-auto sm:right-4 z-50 max-w-md w-full mx-auto animate-in slide-in-from-top-4 duration-300">
      <div 
        onClick={onOpenCenter}
        className="bg-slate-900/95 text-white rounded-2xl p-3.5 shadow-2xl border border-[#06C755]/40 backdrop-blur-md cursor-pointer hover:bg-slate-900 transition-all flex items-start gap-3 relative overflow-hidden group"
      >
        {/* Left Green Accent Bar */}
        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#06C755]" />

        {/* LINE Icon Badge */}
        <div className="w-10 h-10 rounded-xl bg-[#06C755] text-white flex items-center justify-center shrink-0 shadow-md">
          <MessageCircle className="w-5 h-5 fill-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-bold text-[#06C755] flex items-center gap-1">
              <span>LINE Official Account</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#06C755]" />
            </span>
            <span>{notification.time || 'เมื่อสักครู่'}</span>
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
            {notification.title}
          </h4>

          <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-2 mt-0.5 leading-snug">
            {notification.message}
          </p>

          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 mt-1.5">
            <span>แตะเพื่อเปิดอ่านในศูนย์แจ้งเตือน LINE</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
