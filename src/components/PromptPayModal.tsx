import { useState, useEffect } from 'react';
import { X, CheckCircle, ShieldCheck, Download, Smartphone } from 'lucide-react';

interface PromptPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  orderNumber: string;
  onPaymentSuccess: () => void;
}

export function PromptPayModal({
  isOpen,
  onClose,
  totalAmount,
  orderNumber,
  onPaymentSuccess,
}: PromptPayModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 minutes
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSecondsLeft(300);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* PromptPay Official Style Header */}
        <div className="bg-[#003B71] text-white p-4 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/70 hover:text-white p-1 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center justify-center gap-1.5 bg-white text-[#003B71] px-3 py-1 rounded-lg font-black text-xs tracking-wider shadow-sm mb-1">
            <span>Thai QR Payment</span>
            <span className="text-[10px] text-blue-600 font-bold">• พร้อมเพย์</span>
          </div>

          <p className="text-xs text-blue-200">สแกนจ่ายผ่านแอปธนาคารได้ทุกธนาคาร</p>
        </div>

        {/* QR Code and Details */}
        <div className="p-6 text-center">
          <div className="text-xs text-slate-500 mb-1">ออเดอร์ #{orderNumber}</div>
          <div className="text-2xl font-black text-slate-900 mb-4">
            ฿{totalAmount.toLocaleString()}
          </div>

          {/* QR Box */}
          <div className="inline-block p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-inner relative">
            <svg
              className="w-48 h-48 mx-auto"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Decorative realistic QR matrix pattern */}
              <rect width="100" height="100" fill="white" />
              {/* Corner 1 */}
              <rect x="5" y="5" width="26" height="26" fill="#003B71" rx="3" />
              <rect x="9" y="9" width="18" height="18" fill="white" rx="2" />
              <rect x="13" y="13" width="10" height="10" fill="#003B71" rx="1" />
              {/* Corner 2 */}
              <rect x="69" y="5" width="26" height="26" fill="#003B71" rx="3" />
              <rect x="73" y="9" width="18" height="18" fill="white" rx="2" />
              <rect x="77" y="13" width="10" height="10" fill="#003B71" rx="1" />
              {/* Corner 3 */}
              <rect x="5" y="69" width="26" height="26" fill="#003B71" rx="3" />
              <rect x="9" y="73" width="18" height="18" fill="white" rx="2" />
              <rect x="13" y="77" width="10" height="10" fill="#003B71" rx="1" />
              {/* Matrix dots */}
              <rect x="36" y="8" width="5" height="5" fill="#003B71" />
              <rect x="45" y="8" width="5" height="5" fill="#003B71" />
              <rect x="55" y="8" width="5" height="5" fill="#003B71" />
              <rect x="36" y="18" width="5" height="5" fill="#003B71" />
              <rect x="45" y="18" width="5" height="5" fill="#003B71" />
              <rect x="55" y="18" width="5" height="5" fill="#003B71" />
              <rect x="8" y="36" width="5" height="5" fill="#003B71" />
              <rect x="18" y="36" width="5" height="5" fill="#003B71" />
              <rect x="28" y="36" width="5" height="5" fill="#003B71" />
              <rect x="38" y="36" width="24" height="24" fill="#003B71" rx="4" />
              <rect x="68" y="36" width="5" height="5" fill="#003B71" />
              <rect x="78" y="36" width="5" height="5" fill="#003B71" />
              <rect x="88" y="36" width="5" height="5" fill="#003B71" />
              <rect x="8" y="48" width="5" height="5" fill="#003B71" />
              <rect x="18" y="48" width="5" height="5" fill="#003B71" />
              <rect x="28" y="48" width="5" height="5" fill="#003B71" />
              <rect x="68" y="48" width="5" height="5" fill="#003B71" />
              <rect x="78" y="48" width="5" height="5" fill="#003B71" />
              <rect x="88" y="48" width="5" height="5" fill="#003B71" />
              <rect x="36" y="68" width="5" height="5" fill="#003B71" />
              <rect x="45" y="68" width="5" height="5" fill="#003B71" />
              <rect x="55" y="68" width="5" height="5" fill="#003B71" />
              <rect x="68" y="68" width="5" height="5" fill="#003B71" />
              <rect x="78" y="68" width="5" height="5" fill="#003B71" />
              <rect x="88" y="68" width="5" height="5" fill="#003B71" />
              <rect x="36" y="78" width="5" height="5" fill="#003B71" />
              <rect x="45" y="78" width="5" height="5" fill="#003B71" />
              <rect x="55" y="78" width="5" height="5" fill="#003B71" />
              <rect x="68" y="78" width="5" height="5" fill="#003B71" />
              <rect x="78" y="78" width="5" height="5" fill="#003B71" />
              <rect x="88" y="78" width="5" height="5" fill="#003B71" />
              {/* Thai PromptPay center icon */}
              <circle cx="50" cy="50" r="8" fill="white" />
              <text x="50" y="53" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#003B71">PP</text>
            </svg>

            <div className="text-[10px] text-slate-400 mt-2 font-mono">
              บัญชี: ร้านกุ้งเผาเผา 烤烤 (Kǎo Kǎo Seafood)
            </div>
          </div>

          {/* Timer */}
          <div className="mt-3 text-xs text-slate-500 font-medium">
            กรุณาชำระเงินภายใน <span className="font-bold text-rose-500">{formattedTime}</span> นาที
          </div>

          {/* Simulation Button */}
          <button
            type="button"
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="w-full mt-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>กำลังยืนยันยอดเงินจากธนาคาร...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>จำลอง: สแกนชำระเงินสำเร็จ</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-slate-400 mt-2">
            ระบบจำลองชำระเงินอัตโนมัติ (Mock Sandbox Payment)
          </p>
        </div>
      </div>
    </div>
  );
}
