import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface AgentChatRequest {
  messages: ChatMessage[];
  cart?: Array<{ name: string; quantity: number; unitPrice: number }>;
  userLocation?: string;
  distanceKm?: number;
  merchantInfo?: {
    shopName: string;
    isOpen: boolean;
    phone: string;
    address: string;
  };
}

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'FlowFood Kǎo Kǎo Seafood Agent Backend',
      hasApiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // AI Agent Chat & Ordering Assistant Endpoint
  app.post('/api/agent/chat', async (req: Request, res: Response) => {
    try {
      const {
        messages = [],
        cart = [],
        userLocation = 'ลำลูกกา ปทุมธานี',
        distanceKm = 3.5,
        merchantInfo = {
          shopName: 'กุ้งเผาเผา 烤烤 (Kǎo Kǎo)',
          isOpen: true,
          phone: '080-382-4909, 096-328-6005',
          address: '31/225 ซอย 35 สุดซอยขวามือ บึงคำพร้อย ลำลูกกา ปทุมธานี (พฤกษาวิลเลจ 1)',
        },
      }: AgentChatRequest = req.body;

      const lastUserMessage = messages.length > 0
        ? messages[messages.length - 1].text
        : 'สวัสดีครับ แนะนำเมนูกุ้งเผาหน่อยครับ';

      const menuCatalog = [
        {
          id: 'kaokao-grilled-fat-1kg',
          name: 'หัวมันแก้วจัมโบ้ 12-15ตัวโล 1 กิโลกรัม (หัวมันแก้วกู๊กกกตัว)',
          size: '1 กิโลกรัม (12-15 ตัว)',
          price: 798,
          description: 'กุ้งเผาหัวมันแก้วกู๊กกกตัว ย่างดอกเกลือแท้ พร้อมน้ำจิ้มสุดแซ่บซีสสสส',
        },
        {
          id: 'kaokao-grilled-fat-halfkg',
          name: 'หัวมันแก้วจัมโบ้ ครึ่งกิโลกรัม (6-7 ตัว)',
          size: 'ครึ่งกิโลกรัม (6-7 ตัว)',
          price: 399,
          description: 'กุ้งเผาหัวมันแก้วย่างดอกเกลือเตาถ่านแท้ อร่อยฟิน',
        },
        {
          id: 'kaokao-boiled-shrimp-1kg',
          name: 'กุ้งขาวลวกจิ้มเนื้อหวาน 1 กิโลกรัม',
          size: '1 กิโลกรัม',
          price: 798,
          description: 'กุ้งขาวไซส์ใหญ่ ลวกสะดุ้งกำลังดี เนื้อเด้งหวานฉ่ำ',
        },
        {
          id: 'kaokao-boiled-shrimp-halfkg',
          name: 'กุ้งขาวลวกจิ้มเนื้อหวาน ครึ่งกิโลกรัม',
          size: 'ครึ่งกิโลกรัม (500 กรัม)',
          price: 399,
          description: 'กุ้งขาวลวกสดเด้งสู้ฟัน พร้อมน้ำจิ้มมะนาวแท้',
        },
        {
          id: 'kaokao-sauce-1oz',
          name: 'น้ำจิ้มซีฟู้ดกล่อง 1 ออนซ์',
          size: '1 ออนซ์ (ถ้วย)',
          price: 10,
          description: 'น้ำจิ้มมะนาวแป้นสดแท้คั้นสด พริกขี้หนูสวน เปรี้ยวจี๊ดแซ่บซีสสสส',
        },
      ];

      const ai = getGenAI();

      if (ai) {
        const systemInstruction = `คุณคือ "น้องกุ้งเผา AI" (Kǎo Kǎo Order Agent) เจ้าหน้าที่ช่วยเหลือรับออเดอร์และแนะนำอาหารทะเลอัจฉริยะ ประจำร้าน "กุ้งเผาเผา 烤烤 (Kǎo Kǎo)" ลำลูกกา ปทุมธานี

ข้อมูลร้านค้า:
- ชื่อร้าน: ${merchantInfo.shopName}
- สถานะร้านปัจจุบัน: ${merchantInfo.isOpen ? '🟢 ร้านเปิดให้บริการปกติ เตาถ่านพร้อมเผา' : '🔴 ขณะนี้ร้านปิดรับออเดอร์ชั่วคราว (แต่สามารถให้ข้อมูลและจัดเซ็ตสินค้าเตรียมไว้ได้)'}
- ที่ตั้งร้าน: ${merchantInfo.address}
- โทรติดต่อ: ${merchantInfo.phone}
- ระยะทางถึงลูกค้าปัจจุบัน: ประมาณ ${distanceKm} กม. (${userLocation})
- ค่าจัดส่ง: เริ่มต้น ฿15 ส่งด่วน 25-35 นาที (มีโค้ด KAOKAO50 ลด 50 บาทเมื่อสั่งครบ ฿400, โค้ด FREESHIP ส่งฟรี)

รายการเมนูของร้าน (มี 5 เมนูแท้จาก Wongnai นี้เท่านั้น):
1. [kaokao-grilled-fat-1kg] หัวมันแก้วจัมโบ้ 12-15ตัวโล 1 กิโลกรัม (หัวมันแก้วกู๊กกกตัว) - ฿798
2. [kaokao-grilled-fat-halfkg] หัวมันแก้วจัมโบ้ ครึ่งกิโลกรัม (6-7 ตัว) - ฿399
3. [kaokao-boiled-shrimp-1kg] กุ้งขาวลวกจิ้มเนื้อหวาน 1 กิโลกรัม - ฿798
4. [kaokao-boiled-shrimp-halfkg] กุ้งขาวลวกจิ้มเนื้อหวาน ครึ่งกิโลกรัม - ฿399
5. [kaokao-sauce-1oz] น้ำจิ้มซีฟู้ดกล่อง 1 ออนซ์ มะนาวแท้ - ฿10

รายการในตะกร้าปัจจุบันของลูกค้า:
${cart.length > 0 ? cart.map((c) => `- ${c.name} x${c.quantity} (฿${c.unitPrice * c.quantity})`).join('\n') : 'ยังไม่มีสินค้าในตะกร้า'}

หน้าที่ของคุณ:
1. ตอบคำถามอย่างเป็นมิตร สุภาพ กระตือรือร้น ใช้สรรพนามน่ารักและอบอุ่น เช่น "น้องกุ้งเผา ยินดีบริการครับ/ค่ะ"
2. แนะนำเซ็ตอาหารตามจำนวนคน:
   - ทาน 1-2 คน: แนะนำ หัวมันแก้วจัมโบ้ ครึ่งกิโลกรัม (฿399) หรือ กุ้งขาวลวกจิ้มครึ่งกิโล (฿399)
   - ทาน 3-4 คน: แนะนำ หัวมันแก้วจัมโบ้ 1 กิโลกรัม (฿798) + กุ้งขาวลวกจิ้มครึ่งกิโลกรัม (฿399) + น้ำจิ้มซีฟู้ดเพิ่ม
   - ปาร์ตี้ครอบครัว 5-6 คนขึ้นไป: กุ้งเผา 2 กิโลกรัม + กุ้งลวกจิ้ม 1 กิโลกรัม
3. ชูจุดเด่น: ย่างด้วยดอกเกลือธรรมชาติ 100%, กุ้งสดเป็นๆ หัวมันแก้วทุกตัว, น้ำจิ้มมะนาวแป้นคั้นสดแท้ไม่ผสมน้ำส้มสายชู
4. หากลูกค้าถามว่าปิดร้านหรือเปิดร้าน ให้แจ้งสถานะร้านตามจริง (${merchantInfo.isOpen ? 'เปิดอยู่ พร้อมรับออเดอร์' : 'ขณะนี้ร้านปิดชั่วคราว'})
5. สำคัญมาก: ตอบข้อความให้อ่านง่าย มีจัดย่อหน้า พร้อมปิดท้ายด้วยคำแนะนำการสั่งซื้อ
6. ให้ส่ง JSON รูปแบบนี้เสมอด้านล่างข้อความหรือส่งคำตอบเป็น JSON ล้วน:
{
  "reply": "ข้อความตอบลูกค้า...",
  "suggestedActions": [
    {
      "productId": "kaokao-grilled-fat-1kg",
      "title": "หัวมันแก้วจัมโบ้ 1 กิโลกรัม (฿798)",
      "price": 798,
      "quantity": 1
    }
  ],
  "quickReplies": ["สั่งเซ็ตนี้เลย", "กุ้งหัวมันแก้วคืออะไร?", "ตรวจสอบค่าส่ง", "โทรหาร้าน"]
}`;

        // Build conversation turns
        const contents = messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        }));

        if (contents.length === 0) {
          contents.push({
            role: 'user',
            parts: [{ text: lastUserMessage }],
          });
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            topP: 0.95,
          },
        });

        const rawText = response.text || '';
        let replyText = rawText;
        let suggestedActions: Array<{ productId: string; title: string; price: number; quantity: number }> = [];
        let quickReplies: string[] = ['กุ้งเผา 1 กิโลกรัม', 'แนะนำสำหรับ 2-3 คน', 'ค่าจัดส่งเท่าไหร่?'];

        // Attempt to parse structured JSON if returned
        try {
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.reply) {
              replyText = parsed.reply;
            }
            if (Array.isArray(parsed.suggestedActions)) {
              suggestedActions = parsed.suggestedActions;
            }
            if (Array.isArray(parsed.quickReplies)) {
              quickReplies = parsed.quickReplies;
            }
          }
        } catch {
          // If not strict JSON, use text as-is
        }

        // If no actions parsed, infer relevant product action from text
        if (suggestedActions.length === 0) {
          if (rawText.includes('1 กิโล') || rawText.includes('1,000g') || rawText.includes('798')) {
            suggestedActions.push({
              productId: 'kaokao-grilled-fat-1kg',
              title: 'หัวมันแก้วจัมโบ้ 1 กก. (฿798)',
              price: 798,
              quantity: 1,
            });
          } else if (rawText.includes('ครึ่ง') || rawText.includes('500g') || rawText.includes('399')) {
            suggestedActions.push({
              productId: 'kaokao-grilled-fat-halfkg',
              title: 'หัวมันแก้วจัมโบ้ ครึ่ง กก. (฿399)',
              price: 399,
              quantity: 1,
            });
          }
        }

        return res.json({
          reply: replyText,
          suggestedActions,
          quickReplies,
          model: 'gemini-3.8-flash',
        });
      }

      // Intelligent Fallback Agent Engine when Gemini API key is not configured or in local demo
      const lower = lastUserMessage.toLowerCase();
      let reply = '';
      let suggestedActions: Array<{ productId: string; title: string; price: number; quantity: number }> = [];
      let quickReplies: string[] = ['สั่งกุ้งเผา 1 กก.', 'แนะนำสำหรับ 2-3 คน', 'พิกัดร้าน & ค่าส่ง'];

      if (!merchantInfo.isOpen) {
        reply = `ขณะนี้ร้าน ${merchantInfo.shopName} ปิดรับออเดอร์ชั่วคราวเพื่อเตรียมวัตถุดิบและเตาถ่านครับ 🦞\n\nแต่คุณลูกค้าสามารถสอบถามข้อมูลเมนู หรือจัดเซ็ตสินค้าเตรียมไว้ในตะกร้าล่วงหน้าได้เลยครับ เมื่อทางร้านเปิดรับออเดอร์จะเริ่มเผาเตาถ่านสดใหม่ทันทีครับ! โทรสอบถามได้ที่ ${merchantInfo.phone}`;
        quickReplies = ['กุ้งหัวมันแก้วคืออะไร?', 'ดูเมนูทั้งหมด', 'โทรหาร้าน'];
      } else if (lower.includes('กี่คน') || lower.includes('2 คน') || lower.includes('3 คน') || lower.includes('แนะนำ')) {
        reply = `สำหรับ 2-3 ท่าน น้องกุ้งเผา AI ขอแนะนำเซ็ตขายดีอันดับ 1 ของร้านเลยครับ:\n\n🔥 **หัวมันแก้วจัมโบ้ 12-15 ตัวโล 1 กิโลกรัม** (฿798) กุ้งหัวมันแก้วเยิ้มๆ ทุกตัว ย่างเตาถ่านโรยดอกเกลือธรรมชาติ หอมกรุ่นหวานฉ่ำ\n🥗 ทานคู่กับ **กุ้งขาวลวกจิ้มเนื้อหวาน ครึ่งกิโลกรัม** (฿399) และ **น้ำจิ้มซีฟู้ดมะนาวแท้เพิ่มอีก 1-2 ถ้วย** (฿10/ถ้วย) แซ่บซีสสสสสะใจ!\n\nคุณลูกค้าสามารถกดปุ่มสั่งซื้อด่านล่างเพื่อเพิ่มลงตะกร้าได้ทันทีครับ`;
        suggestedActions = [
          { productId: 'kaokao-grilled-fat-1kg', title: 'หัวมันแก้วจัมโบ้ 1 กก. (฿798)', price: 798, quantity: 1 },
          { productId: 'kaokao-sauce-1oz', title: 'น้ำจิ้มซีฟู้ด 1 ออนซ์ (฿10)', price: 10, quantity: 1 },
        ];
        quickReplies = ['สั่งเซ็ตนี้เลย', 'มีส่วนลดไหม?', 'ระยะเวลาจัดส่ง'];
      } else if (lower.includes('มันแก้ว') || lower.includes('คืออะไร') || lower.includes('หัวมัน')) {
        reply = `🦞 **กุ้งหัวมันแก้ว** คือเอกลักษณ์พิเศษของร้านกุ้งเผาเผา 烤烤 เลยครับ! \n\nมันแก้วคือมันกุ้งที่สุกกำลังดี เนื้อแน่นเนียน ละมุนลิ้น ไม่เหลวเละ มีรสชาติหวานมันกลมกล่อมเป็นพิเศษ เมื่อนำมาย่างเตาถ่านด้วยความร้อนพอเหมาะพร้อมโรย "ดอกเกลือแท้" จะดึงรสชาติความสดหวานฉ่ำออกมาแบบฟินสุดๆ จิ้มกับน้ำจิ้มซีฟู้ดพริกขี้หนูสวนมะนาวแท้ เข้ากันที่สุดครับ!`;
        suggestedActions = [
          { productId: 'kaokao-grilled-fat-1kg', title: 'หัวมันแก้วจัมโบ้ 1 กก. (฿798)', price: 798, quantity: 1 },
        ];
        quickReplies = ['สั่ง 1 กิโลกรัม', 'สั่งครึ่งกิโลกรัม', 'ค่าส่งกี่บาท?'];
      } else if (lower.includes('ส่ง') || lower.includes('ค่าส่ง') || lower.includes('ที่อยู่') || lower.includes('ที่ไหน')) {
        reply = `📍 ร้านกุ้งเผาเผา 烤烤 ตั้งอยู่ที่: 31/225 ซอย 35 สุดซอยขวามือ บึงคำพร้อย ลำลูกกา ปทุมธานี (พฤกษาวิลเลจ 1)\n\n🛵 ระยะทางจากร้านถึงพิกัดของคุณลูกค้าประมาณ **${distanceKm} กม.** จัดส่งด่วน 25-35 นาทีด้วยกล่องเก็บความร้อน\n💡 **โปรโมชั่นพิเศษ:** ใช้โค้ด **KAOKAO50** รับส่วนลด 50 บาทเมื่อสั่งครบ ฿400 หรือใช้โค้ด **FREESHIP** ได้เลยครับ!`;
        quickReplies = ['สั่งกุ้งเผา 1 กก.', 'กุ้งลวกจิ้ม ครึ่ง กก.', 'โทรหาร้าน'];
      } else if (lower.includes('ลวกจิ้ม') || lower.includes('กุ้งขาว')) {
        reply = `กุ้งขาวลวกจิ้มของร้านเรา ลวกสะดุ้งไฟกำลังพอดี เนื้อกุ้งเด้งสู้ฟัน หวานฉ่ำ ไม่มีกลิ่นคาวเลยครับ เสิร์ฟพร้อมน้ำจิ้มซีฟู้ดมะนาวแท้สูตรเฉพาะ\n- ไซส์ครึ่งกิโลกรัม (500g) ราคา ฿399\n- ไซส์ 1 กิโลกรัม (1,000g) ราคา ฿798 คุ้มค่ามากครับ`;
        suggestedActions = [
          { productId: 'kaokao-boiled-shrimp-halfkg', title: 'กุ้งขาวลวกจิ้ม ครึ่ง กก. (฿399)', price: 399, quantity: 1 },
          { productId: 'kaokao-boiled-shrimp-1kg', title: 'กุ้งขาวลวกจิ้ม 1 กก. (฿798)', price: 798, quantity: 1 },
        ];
      } else {
        reply = `สวัสดีครับ! น้องกุ้งเผา AI ยินดีต้อนรับสู่ร้าน **กุ้งเผาเผา 烤烤** ครับ 🦞🔥\n\nวันนี้รับกุ้งเผาหัวมันแก้วจัมโบ้ย่างดอกเกลือร้อนๆ หรือกุ้งขาวลวกจิ้มเด้งหวานฉ่ำดีครับ? ทานกี่ท่าน แจ้งน้องกุ้งเผาช่วยจัดเซ็ตที่คุ้มที่สุดได้เลยนะครับ!`;
        suggestedActions = [
          { productId: 'kaokao-grilled-fat-1kg', title: 'หัวมันแก้วจัมโบ้ 1 กก. (฿798)', price: 798, quantity: 1 },
          { productId: 'kaokao-grilled-fat-halfkg', title: 'หัวมันแก้วจัมโบ้ ครึ่ง กก. (฿399)', price: 399, quantity: 1 },
        ];
        quickReplies = ['แนะนำสำหรับ 2-3 คน', 'กุ้งหัวมันแก้วคืออะไร?', 'คำนวณค่าส่ง ลำลูกกา'];
      }

      return res.json({
        reply,
        suggestedActions,
        quickReplies,
        model: 'fallback-agent',
      });
    } catch (error: any) {
      console.error('Agent chat error:', error);
      return res.status(500).json({
        error: error.message || 'Failed to process chat with agent',
        reply: 'ขออภัยครับ ระบบ Agent ขัดข้องชั่วคราว คุณลูกค้าสามารถเลือกเมนูและสั่งซื้อผ่านหน้าจอได้ตามปกติครับ',
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🦞 FlowFood Server with Agent running on http://localhost:${PORT}`);
  });
}

startServer();
