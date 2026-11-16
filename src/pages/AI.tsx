import React, { useState, useRef, useEffect } from 'react';
import { Translate } from '../App';
import { Send, User, Sparkles, Copy, Trash2, Check } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  expression?: 'default' | 'thinking' | 'error';
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Mapping ekspresi lokal dari folder /public/AI_Expressions/
// Pastikan nama file gambar di dalam folder public/AI_Expressions/ sesuai dengan path di bawah:
const AI_EXPRESSIONS = {
  default: "/AI_Expressions/normal.png",     // Sun3ss ngobrol biasa
  thinking: "/AI_Expressions/thinking.png",   // Sun3ss bingung / loading
  error: "/AI_Expressions/error.png"        // Sun3ss error / pusing
};

const QUICK_PROMPTS = [
  "Halo Suness! Lagi ngapain nih?",
  "Ceritain dong tentang wujud naga-sigung kamu",
  "Rekomendasiin playlist musik santai buat ngoding",
  "Tips merawat & servis PC dong"
];

export function AI() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('fsc_ai_messages');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Gagal memuat riwayat chat", e);
    }
    return [
      { 
        id: '1', 
        role: 'assistant', 
        text: 'Halo! Aku Suness, asisten naga-sigung hibrida dari Furry Society Group (FSC). Mau ngobrol santai, nanya soal teknologi, atau butuh bantuan apa nih hari ini? :3', 
        expression: 'default' 
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentExpression, setCurrentExpression] = useState<keyof typeof AI_EXPRESSIONS>('default');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('fsc_ai_messages', JSON.stringify(messages));
    } catch (e) {
      console.error("Gagal menyimpan riwayat chat", e);
    }
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || loading) return;

    if (!GROQ_API_KEY) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', text: 'Error: VITE_GROQ_API_KEY belum di-set di environment variables Vercel atau file .env!', expression: 'error' }
      ]);
      setCurrentExpression('error');
      return;
    }

    const userMessage = messageText.trim();
    if (!textToSend) setInput('');
    
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', text: userMessage }]);
    setLoading(true);
    setCurrentExpression('thinking'); // Berubah ekspresi jadi mikir pas AI lagi ngetik

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
            { 
              role: "system", 
              content: "Kamu adalah Suness, seekor naga-sigung (dragon-skunk hybrid) antropomorfik berwarna hitam-putih dengan corak sirkuit hijau menyala. Kamu adalah asisten setia dan maskot dari platform Furry Society Group (FSC). Kepribadianmu ramah, asyik diajak ngobrol santai, humoris, setia kawan, paham banget soal teknologi (coding, Linux, web dev, hardware komputer/HP), fandom furry, game, dan seni digital. PENTING: Jawablah dengan teks biasa yang bersih, natural, dan santai. JANGAN GUNAKAN simbol markdown seperti tanda bintang ganda (**), garis miring (*), pagar (#), atau tabel bergaris. Gunakan gaya bahasa obrolan santai khas anak muda/gamer Indonesia (seperti sapaan akrab, kata 'nih', 'dong', atau emotikon lucu seperti ':3'), dan pastikan jawabanmu akurat serta tidak membahas konten sensitif." 
            },
            { role: "user", content: userMessage }
          ],
          stream: false
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Terjadi kesalahan saat menghubungi server Groq.');
      }

      let replyText = data.choices[0].message.content;
      replyText = replyText.replace(/[*#_`]/g, '');

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', text: replyText, expression: 'default' }
      ]);
      setCurrentExpression('default'); // Kembali normal pas selesai jawab
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', text: `Duh, Suness lagi pusing nih kena error: ${error.message}`, expression: 'error' }
      ]);
      setCurrentExpression('error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    const initialMsg = [{ 
      id: '1', 
      role: 'assistant' as const, 
      text: 'Riwayat chat udah dibersihin! Mau ngobrolin apa lagi sama Suness? :3', 
      expression: 'default' as const 
    }];
    setMessages(initialMsg);
    setCurrentExpression('default');
    localStorage.removeItem('fsc_ai_messages');
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="absolute inset-x-0 top-16 bottom-0 w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col overflow-hidden z-10 py-4">
      
      {/* Box Utama Pembungkus AI Chat */}
      <div className="flex-1 flex flex-col bg-zinc-950/80 border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md min-h-0">
        
        {/* HEADER PROFIL & EKSPRESI AI */}
        <div className="px-5 py-4 bg-zinc-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            {/* Foto Profil / Avatar Ekspresi Dinamis */}
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-purple-500/40 shadow-md shadow-purple-500/20 shrink-0 bg-zinc-900">
              <img 
                src={AI_EXPRESSIONS[currentExpression] || AI_EXPRESSIONS.default} 
                alt="Suness Avatar" 
                className="w-full h-full object-cover transition-all duration-300"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-zinc-950 rounded-full animate-pulse"></span>
            </div>

            <div>
              <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Suness - FSC AI Companion
              </h1>
              <p className="text-[11px] sm:text-xs text-purple-400 font-medium">
                Online • Dragon-Skunk Hybrid Assistant
              </p>
            </div>
          </div>

          <button
            onClick={handleClearHistory}
            title="Bersihkan Riwayat Chat"
            className="bg-zinc-900/80 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-zinc-400 hover:text-red-400 p-2.5 rounded-2xl transition-all flex items-center gap-2 text-xs"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Reset Chat</span>
          </button>
        </div>

        {/* BORDER PEMISAH ELEGAN DENGAN EFEK GRADIENT GLOW */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent shrink-0"></div>

        {/* BOX AREA OBROLAN CHAT */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 sm:p-6 min-h-0">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl overflow-hidden border border-purple-500/30 shrink-0 mt-1 shadow-sm">
                  <img 
                    src={AI_EXPRESSIONS[msg.expression || 'default']} 
                    alt="AI Avatar" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}

              <div className="relative max-w-[80%] flex flex-col">
                <div
                  className={`rounded-2xl px-4 py-3 text-xs sm:text-sm whitespace-pre-wrap shadow-md leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none shadow-purple-600/20'
                      : 'bg-zinc-900/90 text-zinc-200 rounded-tl-none border border-white/10'
                  }`}
                >
                  {msg.text}
                </div>

                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleCopyText(msg.text, msg.id)}
                    className="absolute -bottom-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 shadow-md"
                  >
                    {copiedId === msg.id ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                    {copiedId === msg.id ? 'Disalin!' : 'Salin'}
                  </button>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 mt-1">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="flex items-start gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-purple-500/30 shrink-0 shadow-sm">
                <img src={AI_EXPRESSIONS.thinking} alt="Thinking" className="w-full h-full object-cover" />
              </div>
              <div className="bg-zinc-900/90 text-zinc-400 rounded-2xl rounded-tl-none px-4 py-3 text-xs sm:text-sm border border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts Chips & Input Form */}
        <div className="p-4 bg-zinc-900/40 border-t border-white/10 flex flex-col gap-3 shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {QUICK_PROMPTS.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="whitespace-nowrap bg-zinc-900/80 hover:bg-purple-600/20 border border-white/10 hover:border-purple-500/40 text-zinc-300 hover:text-purple-300 text-xs px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
              >
                🐾 {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ngobrol santai sama Suness..."
              disabled={loading}
              className="flex-1 bg-black/60 border border-white/15 text-white rounded-2xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all backdrop-blur-md"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-500 active:scale-95 disabled:opacity-50 disabled:scale-100 text-white font-medium rounded-2xl px-5 py-3 text-xs sm:text-sm transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
            >
              <Send size={16} />
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
