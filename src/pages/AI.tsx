import React, { useState, useRef, useEffect } from 'react';
import { Translate } from '../App';
import { Send, Bot, User, Sparkles, Copy, Trash2, Check } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const QUICK_PROMPTS = [
  "Halo Suness! Lagi ngapain nih?",
  "Ceritain dong tentang wujud naga-sigung kamu",
  "Rekomendasiin playlist musik santai buat ngoding",
  "Tips merawat & servis PC dong"
];

export function AI() {
  // Load riwayat chat dari localStorage jika ada
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
      { id: '1', role: 'assistant', text: 'Halo! Aku Suness, asisten naga-sigung hibrida dari Furry Society Group (FSC). Mau ngobrol santai, nanya soal teknologi, atau butuh bantuan apa nih hari ini? :3' }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Simpan riwayat chat ke localStorage setiap kali ada perubahan messages
  useEffect(() => {
    try {
      localStorage.setItem('fsc_ai_messages', JSON.stringify(messages));
    } catch (e) {
      console.error("Gagal menyimpan riwayat chat", e);
    }
  }, [messages]);

  // Auto-scroll ke pesan paling bawah setiap kali ada pesan baru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || loading) return;

    if (!GROQ_API_KEY) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', text: 'Error: VITE_GROQ_API_KEY belum di-set di environment variables Vercel atau file .env!' }
      ]);
      return;
    }

    const userMessage = messageText.trim();
    if (!textToSend) setInput('');
    
    // 1. Tambahkan pesan user ke UI chat
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // 2. Tembak Groq API Endpoint dengan System Prompt agar Suness merespons bersih tanpa simbol markdown
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
              content: "Kamu adalah Suness, seekor naga-sigung (dragon-skunk hybrid) antropomorfik berwarna hitam-putih dengan corak sirkuit hijau menyala. Kamu adalah asisten setia dan maskot dari platform Furry Society Group (FSC). Kepribadianmu ramah, asyik diajak ngobrol santai, humoris, setia kawan, paham banget soal teknologi (coding, Linux, web dev, hardware komputer/HP), fandom furry, game, dan seni digital. PENTING: Jawablah dengan teks biasa yang bersih, natural, dan santai. JANGAN GUNAKAN simbol markdown seperti tanda bintang ganda (**), garis miring (*), pagar (#), atau tabel bergaris yang bisa merusak tampilan chat. Gunakan gaya bahasa obrolan santai khas anak muda/gamer Indonesia (seperti sapaan akrab, kata 'nih', 'dong', atau emotikon lucu seperti ':3'), dan pastikan jawabanmu akurat serta tidak membahas konten sensitif." 
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

      // Bersihkan sisa karakter markdown jikalau masih terbawa dari API
      let replyText = data.choices[0].message.content;
      replyText = replyText.replace(/[*#_`]/g, '');

      // 3. Tambahkan jawaban Suness ke UI chat
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', text: replyText }
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', text: `Duh, Suness lagi pusing nih kena error: ${error.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    const initialMsg = [{ id: '1', role: 'assistant', text: 'Riwayat chat udah dibersihin! Mau ngobrolin apa lagi sama Suness? :3' }];
    setMessages(initialMsg);
    localStorage.removeItem('fsc_ai_messages');
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    // Mengunci tinggi kontainer utama agar halaman web tidak ikut-ikutan scroll ke bawah
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-6 flex flex-col h-screen overflow-hidden relative z-10">
      
      {/* Header Halaman AI (Diam di atas, tidak ikut scroll) */}
      <div className="pb-3 border-b border-white/10 mb-3 backdrop-blur-md flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-purple-400" size={24} />
            Suness - FSC AI Companion
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            <Translate text="Dragon-Skunk Hybrid Assistant for Furry Society Group" />
          </p>
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

      {/* Box Area Obrolan Chat (Hanya area ini yang memiliki scrollbar sendiri) */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 bg-zinc-950/60 border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                <Bot size={16} />
              </div>
            )}

            <div className="relative max-w-[80%] flex flex-col">
              <div
                className={`rounded-2xl px-4 py-3 text-xs sm:text-sm whitespace-pre-wrap shadow-md leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white rounded-tr-none'
                    : 'bg-zinc-900 text-zinc-200 rounded-tl-none border border-white/10'
                }`}
              >
                {msg.text}
              </div>

              {/* Tombol Copy teks per bubble */}
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
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
        
        {/* Efek Loading saat Menunggu Balasan Suness */}
        {loading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-zinc-900 text-zinc-400 rounded-2xl rounded-tl-none px-4 py-3 text-sm border border-white/10 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts Chips (Diam di bawah, tidak ikut scroll halaman) */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 shrink-0 no-scrollbar">
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

      {/* Input Formulir Pengiriman Pesan (Diam di bawah, tidak ikut scroll halaman) */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="mt-2 mb-4 flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ngobrol santai sama Suness..."
          disabled={loading}
          className="flex-1 bg-zinc-900/80 border border-white/10 text-white rounded-2xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all backdrop-blur-md"
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
  );
}
