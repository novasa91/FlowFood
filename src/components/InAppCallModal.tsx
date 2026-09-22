import { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Bike, 
  Store, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { RiderInfo } from '../types';
import { soundEngine } from '../utils/audioUtils';

interface InAppCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'rider' | 'restaurant';
  rider?: RiderInfo;
  orderNumber?: string;
}

export function InAppCallModal({
  isOpen,
  onClose,
  targetType,
  rider,
  orderNumber = 'LM-889920',
}: InAppCallModalProps) {
  const [callState, setCallState] = useState<'dialing' | 'connected' | 'ended'>('dialing');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [riderSpeakingText, setRiderSpeakingText] = useState<string>('');
  const [customerSpokenText, setCustomerSpokenText] = useState<string>('');
  const [showKeypadQuickText, setShowKeypadQuickText] = useState(false);

  const durationTimerRef = useRef<any>(null);
  const autoAnswerTimerRef = useRef<any>(null);

  const targetName = targetType === 'rider' ? rider?.name || 'พี่สมชาย (Kǎo Kǎo Rider)' : 'ครัวกุ้งเผาเผา 烤烤 (พฤกษาวิลเลจ 1)';
  const targetSub = targetType === 'rider' ? `${rider?.bikeModel || 'Honda Wave'} • ${rider?.plate || '1กข 8899'}` : '31/225 ซ.35 บึงคำพร้อย ลำลูกกา • โทร. 080-382-4909, 096-328-6005';
  const targetAvatar = targetType === 'rider' 
    ? rider?.avatarUrl || '/images/products/kaokao-logo.jpg'
    : '/images/products/kaokao-logo.jpg';

  const quickVoicePhrases = [
    'สวัสดีครับ กำลังลงไปรับที่ล็อบบี้',
    'ฝากอาหารไว้ที่ป้อม รปภ. ได้เลยครับ',
    'ห้อง 1408 วางหน้าประตูได้เลยครับ',
    'ขอน้ำจิ้มซีฟู้ดเพิ่มอีกถ้วยทันไหมครับ',
  ];

  // Speech helper
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'th-TH';
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech error:', e);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) {
      soundEngine.stopRinging();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      clearInterval(durationTimerRef.current);
      clearTimeout(autoAnswerTimerRef.current);
      setCallState('dialing');
      setCallDuration(0);
      setRiderSpeakingText('');
      setCustomerSpokenText('');
      return;
    }

    // Start dialing sound
    setCallState('dialing');
    soundEngine.startRinging();

    // Auto connect after 2.8 seconds
    autoAnswerTimerRef.current = setTimeout(() => {
      soundEngine.playConnectedChime();
      setCallState('connected');

      const initialGreeting = targetType === 'rider'
        ? 'สวัสดีครับคุณลูกค้า พี่สมชายไรเดอร์ กุ้งเผาเผา 烤烤 ครับ! อาหารทะเลอุ่นในกล่องโฟมเรียบร้อย กำลังวิ่งนำส่งอย่างปลอดภัยครับ'
        : 'สวัสดีครับ ครัวกุ้งเผาเผา 烤烤 ครับ! เชฟกำลังเตรียมกุ้งแม่น้ำหัวมันแก้วสดๆ พร้อมส่งให้คุณลูกค้าครับ';

      setRiderSpeakingText(initialGreeting);
      speakText(initialGreeting);

      // Start duration counter
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }, 2800);

    return () => {
      soundEngine.stopRinging();
      clearInterval(durationTimerRef.current);
      clearTimeout(autoAnswerTimerRef.current);
    };
  }, [isOpen, targetType]);

  const handleEndCall = () => {
    soundEngine.playHangupTone();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    clearInterval(durationTimerRef.current);
    clearTimeout(autoAnswerTimerRef.current);
    setCallState('ended');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleSendQuickPhrase = (phrase: string) => {
    setCustomerSpokenText(phrase);
    speakText(phrase);

    setTimeout(() => {
      const reply = targetType === 'rider'
        ? 'รับทราบครับคุณลูกค้า เดี๋ยวพี่สมชายจัดการให้ตามนั้นเลยครับ ปลอดภัยแน่นอนครับ!'
        : 'รับทราบครับ ทางร้านเตรียมพร้อมให้ทันทีครับ ขอบคุณมากครับคุณลูกค้า!';
      setRiderSpeakingText(reply);
      speakText(reply);
    }, 1800);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-between min-h-[560px] border border-white/10 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow effects */}
        <div className="absolute top-0 inset-x-0 h-40 bg-radial from-orange-500/20 to-transparent pointer-events-none" />

        {/* Top App Header */}
        <div className="w-full flex items-center justify-between text-xs text-slate-400 z-10">
          <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full text-[11px] font-semibold text-orange-300">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span>Kǎo Kǎo In-App Call (โทรฟรี)</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">#{orderNumber}</span>
        </div>

        {/* Caller Avatar & Name */}
        <div className="flex flex-col items-center text-center my-auto py-4 z-10 w-full">
          <div className="relative mb-4">
            {callState === 'dialing' && (
              <>
                <div className="absolute inset-0 rounded-full bg-orange-500/30 animate-ping duration-1000" />
                <div className="absolute -inset-2 rounded-full border border-orange-400/40 animate-pulse" />
              </>
            )}

            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-orange-500 to-amber-400 shadow-xl overflow-hidden">
              <img
                src={targetAvatar}
                alt={targetName}
                className="w-full h-full rounded-full object-cover"
              />
            </div>

            <div className="absolute bottom-0 right-0 bg-orange-600 text-white p-1.5 rounded-full border-2 border-slate-900 shadow-md">
              {targetType === 'rider' ? <Bike className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {targetName}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-[260px] truncate">
            {targetSub}
          </p>

          {/* Call Status & Timer */}
          <div className="mt-3">
            {callState === 'dialing' ? (
              <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold animate-pulse">
                <span>กำลังโทรออกผ่านเครือข่ายความเร็วสูง...</span>
              </div>
            ) : callState === 'connected' ? (
              <div className="flex flex-col items-center">
                <span className="font-mono text-sm font-bold text-orange-400 bg-orange-950/60 px-3 py-1 rounded-full border border-orange-500/30">
                  {formatTimer(callDuration)}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">สัญญาณเสียงคมชัด HD Audio</span>
              </div>
            ) : (
              <span className="text-xs text-rose-400 font-semibold">สิ้นสุดการสนทนา</span>
            )}
          </div>

          {/* Voice Wave Visualizer when Connected */}
          {callState === 'connected' && (
            <div className="mt-4 flex items-center justify-center gap-1 h-6">
              {[40, 75, 100, 60, 90, 45, 80, 50, 70, 30].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-orange-400 rounded-full animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.8s',
                  }}
                />
              ))}
            </div>
          )}

          {/* Voice Subtitles Banner */}
          {callState === 'connected' && riderSpeakingText && (
            <div className="mt-4 p-3 bg-white/10 rounded-2xl border border-white/15 max-w-xs text-xs text-slate-200 leading-relaxed text-left animate-in fade-in duration-300">
              <div className="text-[10px] text-orange-400 font-bold mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>เสียงสดจาก {targetType === 'rider' ? 'พี่สมชาย' : 'ร้านค้า'}:</span>
              </div>
              "{riderSpeakingText}"
            </div>
          )}

          {customerSpokenText && (
            <div className="mt-2 p-2 bg-orange-600/30 rounded-xl border border-orange-500/40 max-w-xs text-[11px] text-orange-200 text-left">
              <strong>คุณ:</strong> "{customerSpokenText}"
            </div>
          )}
        </div>

        {/* Quick Voice Phrases Drawer/Dropdown for Easy In-App Talking */}
        {callState === 'connected' && (
          <div className="w-full mb-3 z-10">
            <button
              type="button"
              onClick={() => setShowKeypadQuickText(!showKeypadQuickText)}
              className="w-full text-[11px] py-1 text-slate-400 hover:text-orange-300 flex items-center justify-center gap-1 font-semibold transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{showKeypadQuickText ? 'ซ่อนประโยคด่วน' : 'เลือกคำพูดตอบด่วนถึงปลายทาง'}</span>
            </button>

            {showKeypadQuickText && (
              <div className="mt-2 grid grid-cols-1 gap-1.5 p-2 bg-slate-800/80 rounded-2xl border border-white/10 max-h-36 overflow-y-auto">
                {quickVoicePhrases.map((phrase, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendQuickPhrase(phrase)}
                    className="text-left text-xs p-2 rounded-xl bg-slate-700/60 hover:bg-orange-600 hover:text-white transition-colors text-slate-200"
                  >
                    💬 {phrase}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Call Action Buttons Bar */}
        <div className="w-full grid grid-cols-3 gap-4 pt-4 border-t border-white/10 z-10">
          {/* Mute Mic Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${
                isMuted 
                  ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-400/20' 
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={isMuted ? 'เปิดไมค์' : 'ปิดไมค์'}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <span className="text-[10px] text-slate-400">
              {isMuted ? 'ปิดไมค์อยู่' : 'ไมค์'}
            </span>
          </div>

          {/* End Call Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={handleEndCall}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-rose-900/50 transition-all ring-4 ring-rose-500/20 cursor-pointer"
              title="วางสาย"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <span className="text-[10px] text-rose-400 font-bold">วางสาย</span>
          </div>

          {/* Speakerphone Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${
                isSpeakerOn 
                  ? 'bg-orange-500 text-white ring-4 ring-orange-500/20' 
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={isSpeakerOn ? 'เปิดลำโพงอยู่' : 'ปิดลำโพง'}
            >
              {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
            <span className="text-[10px] text-slate-400">
              {isSpeakerOn ? 'ลำโพงเปิด' : 'ลำโพง'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
