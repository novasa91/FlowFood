import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  ShoppingBag, 
  Plus, 
  Check, 
  Store, 
  RefreshCw, 
  Flame, 
  MapPin, 
  Phone,
  ShieldCheck
} from 'lucide-react';
import { SeafoodItem, CartItem, MerchantProfile, CartItemOption } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: Array<{
    productId: string;
    title: string;
    price: number;
    quantity: number;
  }>;
  quickReplies?: string[];
}

interface AgentOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: SeafoodItem[];
  cartItems: CartItem[];
  onAddToCart: (item: SeafoodItem, options: CartItemOption, quantity: number) => void;
  onOpenCart: () => void;
  currentAddress: string;
  distanceKm: number;
  merchant: MerchantProfile | null;
  onOpenAddressModal?: () => void;
}

export function AgentOrderModal({
  isOpen,
  onClose,
  products,
  cartItems,
  onAddToCart,
  onOpenCart,
  currentAddress,
  distanceKm,
  merchant,
  onOpenAddressModal,
}: AgentOrderModalProps) {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'welcome-msg',
      role: 'assistant',
      text: `สวัสดีครับ! ผม **"น้องกุ้งเผา AI" (Kǎo Kǎo Order Agent)** ยินดีต้อนรับสู่ร้าน **กุ้งเผาเผา 烤烤** ครับ 🦞🔥\n\nให้ผมช่วยแนะนำเมนูกุ้งเผาหัวมันแก้วย่างดอกเกลือ จัดเซ็ตสำหรับทานกี่ท่าน หรือช่วยคำนวณงบประมาณและกดสั่งลงตะกร้าได้ทันทีเลยนะครับ วันนี้รับกี่ท่านดีครับ?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        {
          productId: 'kaokao-grilled-fat-1kg',
          title: 'หัวมันแก้วจัมโบ้ 1 กก. (฿798)',
          price: 798,
          quantity: 1,
        },
        {
          productId: 'kaokao-grilled-fat-halfkg',
          title: 'หัวมันแก้วจัมโบ้ ครึ่ง กก. (฿399)',
          price: 399,
          quantity: 1,
        },
      ],
      quickReplies: ['แนะนำสำหรับ 2-3 คน', 'กุ้งหัวมันแก้วคืออะไร?', 'ปาร์ตี้ครอบครัว 4-5 คน', 'พิกัดร้าน & ค่าส่ง'],
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const userMsg: Message = {
      id: userMessageId,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            text: m.text,
          })),
          cart: cartItems.map((c) => ({
            name: c.item.name,
            quantity: c.quantity,
            unitPrice: c.unitPrice,
          })),
          userLocation: currentAddress,
          distanceKm,
          merchantInfo: {
            shopName: merchant?.shopName || 'กุ้งเผาเผา 烤烤 (Kǎo Kǎo)',
            isOpen: merchant ? merchant.isOpen : true,
            phone: merchant?.phone || '080-382-4909, 096-328-6005',
            address: merchant?.address || 'บึงคำพร้อย ลำลูกกา ปทุมธานี',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'รับทราบครับ! มีอะไรให้ผมช่วยเหลือเพิ่มเติมแจ้งได้เลยนะครับ',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: data.suggestedActions || [],
        quickReplies: data.quickReplies || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // Graceful offline fallback response
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: `รับทราบครับ! น้องกุ้งเผาแนะนำเมนูซิกเนเจอร์อันดับ 1 **"หัวมันแก้วจัมโบ้ 12-15 ตัวโล"** ย่างเตาถ่านสดใหม่ โรยดอกเกลือธรรมชาติ 100% หอมหวานฉ่ำทุกตัว สามารถกดปุ่มสั่งซื้อด้านล่างได้ทันทีครับ 🦞🔥`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          {
            productId: 'kaokao-grilled-fat-1kg',
            title: 'หัวมันแก้วจัมโบ้ 1 กก. (฿798)',
            price: 798,
            quantity: 1,
          },
        ],
        quickReplies: ['สั่ง 1 กิโลกรัม', 'สั่งครึ่งกิโลกรัม', 'ดูตะกร้าสินค้า'],
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdd = (action: { productId: string; title: string; price: number; quantity: number }) => {
    // Find matching product in catalog
    const product = products.find((p) => p.id === action.productId) || products[0];
    if (!product) return;

    const defaultOption: CartItemOption = {
      weight: product.weightOptions[0] || { id: 'w-default', name: 'ขนาดมาตรฐาน', priceModifier: 0 },
      cooking: product.cookingOptions[0] || { id: 'c-default', name: 'ย่างเตาถ่านโรยดอกเกลือ', description: '', priceExtra: 0 },
      sauce: product.sauceOptions[0] || { id: 's-default', name: 'น้ำจิ้มซีฟู้ดมะนาวแป้นสดแท้' },
      spiciness: 'เผ็ดปานกลาง (Medium)',
      selectedAddOns: [],
    };

    onAddToCart(product, defaultOption, action.quantity || 1);

    // Mark as added for visual feedback
    const key = `${action.productId}-${Date.now()}`;
    setAddedItemIds((prev) => ({ ...prev, [action.productId]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [action.productId]: false }));
    }, 2500);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        text: `รีเซ็ตการสนทนาเรียบร้อยครับ! ผม **"น้องกุ้งเผา AI"** พร้อมให้คำปรึกษาและช่วยรับออเดอร์แล้วครับ สอบถามเมนูหรือจำนวนคนที่ต้องการทานได้เลยครับ`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          {
            productId: 'kaokao-grilled-fat-1kg',
            title: 'หัวมันแก้วจัมโบ้ 1 กก. (฿798)',
            price: 798,
            quantity: 1,
          },
        ],
        quickReplies: ['แนะนำสำหรับ 2-3 คน', 'กุ้งหัวมันแก้วคืออะไร?', 'คำนวณค่าส่ง ลำลูกกา'],
      },
    ]);
  };

  const isStoreClosed = merchant && !merchant.isOpen;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl flex flex-col h-[85vh] max-h-[720px] overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white p-4 shrink-0 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md ring-2 ring-orange-400/40">
                <Bot className="w-6 h-6" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">น้องกุ้งเผา AI Agent</h3>
                <span className="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/40 px-2 py-0.5 rounded-full font-bold">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>ผู้ช่วยรับออเดอร์ & แนะนำอาหารทะเลสด 烤烤</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleClearHistory}
              title="ล้างประวัติการคุย"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Shop Status Banner in Agent */}
        {isStoreClosed ? (
          <div className="bg-rose-50 px-4 py-2 border-b border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="font-bold">ขณะนี้ร้านปิดรับออเดอร์ชั่วคราว</span>
              <span className="text-rose-600 hidden sm:inline">• แต่สามารถสอบถามข้อมูลและจัดเซ็ตสินค้าเตรียมไว้ได้</span>
            </div>
            {merchant?.phone && (
              <a href={`tel:${merchant.phone}`} className="text-xs font-bold text-rose-700 underline shrink-0 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>โทรติดต่อ</span>
              </a>
            )}
          </div>
        ) : (
          <div className="bg-emerald-50/80 px-4 py-1.5 border-b border-emerald-100 text-[11px] text-emerald-800 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-medium min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate">ส่งไปที่: <strong>{currentAddress}</strong> ({distanceKm} กม.)</span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {onOpenAddressModal && (
                <button
                  type="button"
                  onClick={onOpenAddressModal}
                  className="font-bold text-orange-700 hover:text-orange-800 bg-orange-100 hover:bg-orange-200 px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer"
                >
                  ✏️ แก้ไขที่อยู่
                </button>
              )}
              <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                ส่งด่วน 25-35 นาที
              </span>
            </div>
          </div>
        )}

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
          {messages.map((msg) => {
            const isBot = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2 ${isBot ? 'items-start' : 'items-end'}`}>
                  <div
                    className={`rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isBot
                        ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-sm'
                        : 'bg-orange-500 text-white font-medium rounded-tr-sm'
                    }`}
                  >
                    <div className="whitespace-pre-line">
                      {msg.text.split('\n').map((line, i) => {
                        // Simple parser for bold text **text**
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                          <p key={i} className={i > 0 ? 'mt-1' : ''}>
                            {parts.map((part, pIdx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                  <strong key={pIdx} className="font-extrabold text-orange-900">
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              return part;
                            })}
                          </p>
                        );
                      })}
                    </div>

                    <div
                      className={`text-[10px] mt-1.5 flex items-center justify-end ${
                        isBot ? 'text-slate-400' : 'text-orange-200'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>

                  {/* Product Action Buttons inside chat */}
                  {isBot && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span>เมนูที่ Agent แนะนำ (กดสั่งลงตะกร้าได้ทันที):</span>
                      </div>

                      <div className="grid grid-cols-1 gap-1.5">
                        {msg.suggestedActions.map((action, idx) => {
                          const isAdded = addedItemIds[action.productId];
                          return (
                            <div
                              key={idx}
                              className="bg-white border border-orange-200/80 hover:border-orange-400 rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-2xs transition-all"
                            >
                              <div className="min-w-0">
                                <h4 className="font-bold text-xs text-slate-900 truncate">
                                  {action.title}
                                </h4>
                                <p className="text-[11px] text-orange-600 font-extrabold mt-0.5">
                                  ฿{action.price.toLocaleString()}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleQuickAdd(action)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                  isAdded
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-xs'
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>เพิ่มแล้ว!</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>สั่งลงตะกร้า</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quick Reply Pills */}
                  {isBot && msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.quickReplies.map((reply, rIdx) => (
                        <button
                          key={rIdx}
                          type="button"
                          onClick={() => handleSendMessage(reply)}
                          className="px-2.5 py-1 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-700 text-xs font-semibold rounded-full border border-slate-200 hover:border-orange-300 transition-colors shadow-2xs cursor-pointer"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="bg-white rounded-2xl px-4 py-3 border border-slate-200 shadow-2xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                <span className="text-xs text-slate-500 font-medium">น้องกุ้งเผา AI กำลังพิมพ์คำตอบ...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Cart Status Bar if has items */}
        {cartItems.length > 0 && (
          <div className="bg-orange-50 px-4 py-2 border-t border-orange-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <ShoppingBag className="w-4 h-4 text-orange-600" />
              <span>
                ในตะกร้ามี <strong>{cartItems.reduce((a, b) => a + b.quantity, 0)}</strong> รายการ (฿
                {cartItems.reduce((a, b) => a + b.itemTotal, 0).toLocaleString()})
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCart();
              }}
              className="text-orange-700 hover:text-orange-800 font-bold underline cursor-pointer"
            >
              เปิดดูตะกร้าเพื่อสั่งซื้อ ↗
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="พิมพ์คำถามหรือเมนูที่ต้องการ เช่น 'แนะนำสำหรับ 3 คน', 'กุ้งเผา 1 กิโล'..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all placeholder:text-slate-400"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl shadow-md transition-all shrink-0 cursor-pointer"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
