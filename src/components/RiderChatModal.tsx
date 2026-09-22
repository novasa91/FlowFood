import { useState, useRef, useEffect, useId } from 'react';
import { X, Send, Bike, CheckCheck, PhoneCall } from 'lucide-react';
import { RiderInfo } from '../types';

interface RiderChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  rider: RiderInfo;
  onOpenCall?: () => void;
}

interface Message {
  id: string;
  sender: 'rider' | 'user';
  text: string;
  time: string;
}

export function RiderChatModal({ isOpen, onClose, rider, onOpenCall }: RiderChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'rider',
      text: 'สวัสดีครับผมสมชาย ไรเดอร์ Kǎo Kǎo รับออเดอร์อาหารทะเลเรียบร้อยแล้วครับ กำลังรอรับกล่องโฟมที่ร้านครับ 🛵',
      time: '12:05',
    },
    {
      id: 'm2',
      sender: 'rider',
      text: 'กล่องโฟมแพ็คน้ำแข็งและฟอยล์เก็บความร้อนอย่างดีครับ รับรองสดร้อนถึงมือแน่นอนครับ!',
      time: '12:08',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputId = useId();

  const quickReplies = [
    'ขอบคุณครับพี่สมชาย',
    'วางไว้ที่หน้าห้องได้เลยครับ',
    'กำลังลงไปรับที่ล็อบบี้ครับ',
    'รบกวนโทรแจ้งอีกครั้งเมื่อถึงนะครับ',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text) return;

    const newMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulated rider reply after 1.5 seconds
    setTimeout(() => {
      const riderReply: Message = {
        id: `r-${Date.now()}`,
        sender: 'rider',
        text: 'รับทราบครับผม กำลังรีบขับไปส่งให้อย่างปลอดภัยครับ! 🛵💨',
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, riderReply]);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl h-[85vh] sm:h-[600px] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-orange-500 text-white flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src={rider.avatarUrl}
                alt={rider.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white"
              />
              <span className="w-2.5 h-2.5 bg-orange-300 rounded-full border border-white absolute bottom-0 right-0" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm leading-tight">
                <span>{rider.name}</span>
                <span className="text-[10px] bg-orange-600 text-white px-1.5 py-0.2 rounded font-semibold">
                  Kǎo Kǎo
                </span>
              </div>
              <p className="text-[11px] text-orange-100">{rider.plate} • {rider.bikeModel}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onOpenCall && (
              <button
                type="button"
                onClick={onOpenCall}
                className="p-2 text-white/90 hover:text-white rounded-lg hover:bg-orange-600 transition-colors"
                title="โทรหาไรเดอร์ผ่านแอปฟรี"
              >
                <PhoneCall className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
          <div className="text-center my-1">
            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              เริ่มต้นการสนทนากับไรเดอร์
            </span>
          </div>

          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs sm:text-sm shadow-2xs leading-relaxed ${
                    isUser
                      ? 'bg-orange-500 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-xs'
                  }`}
                >
                  {m.text}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                  <span>{m.time}</span>
                  {isUser && <CheckCheck className="w-3 h-3 text-orange-600" />}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick reply suggestions */}
        <div className="p-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {quickReplies.map((qr, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(qr)}
              className="shrink-0 text-[11px] bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 transition-colors whitespace-nowrap"
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
          <label htmlFor={chatInputId} className="sr-only">
            พิมพ์ข้อความถึงไรเดอร์
          </label>
          <input
            id={chatInputId}
            type="text"
            placeholder="พิมพ์ข้อความถึงไรเดอร์..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 text-xs sm:text-sm px-3.5 py-2 bg-slate-100 rounded-xl border border-transparent focus:border-orange-500 focus:bg-white outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="p-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
