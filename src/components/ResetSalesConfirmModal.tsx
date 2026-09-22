import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, X, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';

interface ResetSalesConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: (includeAddress: boolean) => void;
  totalOrders: number;
  totalRevenue: number;
  currentAddress: string;
}

export function ResetSalesConfirmModal({
  isOpen,
  onClose,
  onConfirmReset,
  totalOrders,
  totalRevenue,
  currentAddress,
}: ResetSalesConfirmModalProps) {
  const [resetAddressToo, setResetAddressToo] = useState(false);
  const [confirmKeyword, setConfirmKeyword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmReset(resetAddressToo);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with warning icon */}
        <div className="bg-rose-50 border-b border-rose-100 p-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-sm shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-rose-900 leading-tight">
                ล้างข้อมูลยอดขาย & นับ 1 ใหม่
              </h3>
              <p className="text-xs text-rose-700/80 mt-0.5">
                Reset Sales Data & Start Over from 1
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span>ยอดขายสะสมปัจจุบันที่จะถูกล้าง:</span>
              <strong className="text-rose-600 text-sm font-black">
                ฿{totalRevenue.toLocaleString()}
              </strong>
            </div>
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span>จำนวนออเดอร์ในระบบ:</span>
              <strong className="text-slate-900 font-bold">{totalOrders} ออเดอร์</strong>
            </div>
            <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-200">
              เมื่อกดล้างข้อมูล ระบบจะเคลียร์ยอดขายทั้งหมดนับ 1 ใหม่ รีเซ็ตกราฟ และเตรียมพร้อมรับออเดอร์สดใหม่ทันที
            </p>
          </div>

          {/* Option to also clear delivery address */}
          <div className="p-3.5 bg-orange-50/70 border border-orange-200/80 rounded-2xl space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={resetAddressToo}
                onChange={(e) => setResetAddressToo(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-orange-600 rounded border-orange-300 focus:ring-orange-500 cursor-pointer"
              />
              <div className="flex-1">
                <span className="font-bold text-orange-950 text-xs block">
                  ล้างข้อมูลที่อยู่จัดส่งเก่าด้วย (ให้กรอกที่อยู่ใหม่)
                </span>
                <span className="text-[11px] text-orange-800/80 mt-0.5 block leading-relaxed">
                  ลบที่อยู่เดิม: <span className="font-medium text-slate-700 underline truncate inline-block max-w-[240px] align-bottom">"{currentAddress}"</span> ออก และเปิดให้ใส่ที่อยู่ใหม่พร้อมคำนวณค่าส่งอัตโนมัติ
                </span>
              </div>
            </label>
          </div>

          <div className="flex items-center gap-2 text-slate-500 bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px]">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              ข้อมูลที่ถูกรีเซ็ตจะถูกเคลียร์ออกจากหน่วยความจำของบราวเซอร์เพื่อเริ่มต้นนับยอดขายใหม่เป็น 0 บาท
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 pt-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>กำลังล้างข้อมูล...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ยืนยันล้างยอดขาย & นับ 1 ใหม่</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
