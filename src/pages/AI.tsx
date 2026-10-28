import React, { useState, useRef, useEffect } from 'react';
import { Translate } from '../App';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;

export function AI() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', text: 'Halo! Aku asisten AI DeepSeek untuk Furry Society Group. Ada yang bisa kubantu hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke pesan paling bawah setiap kali ada pesan baru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    if (!DEEPSEEK_API_KEY) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', text: 'Error: VITE_DEEPSEEK_API_KEY belum di-set di environment variables Vercel atau file .env!' }
      ]);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    
    // 1. Tambahkan pesan user ke UI chat
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // 2. Tembak langsung DeepSeek API
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "Kamu adalah asisten AI yang ramah dan cerdas di platform Furry Society Group." },
            { role: "user", content: userMessage }
          ],
          stream: false
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Terjadi kesalahan saat menghubungi server DeepSeek.');
      }

      const replyText = data.choices[0].message.content;

      // 3. Tambahkan jawaban DeepSeek ke UI chat
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', text: replyText }
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', text: `Error: ${error.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-32 sm:pb-36 flex flex-col h-[calc(100vh-80px)] relative z-10">
      
      {/* Header Halaman AI */}
      <div className="pb-4 border-b border-white/10 mb-4 backdrop-blur-md">
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-purple-400" size={24} />
          Furry Society DeepSeek AI
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          <Translate text="Powered by DeepSeek Chat Model" />
        </p>
      </div>

      {/* Box Area Obrolan Chat */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 bg-zinc-950/60 border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                <Bot size={16} />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs sm:text-sm whitespace-pre-wrap shadow-md leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-none'
                  : 'bg-zinc-900 text-zinc-200 rounded-tl-none border border-white/10'
              }`}
            >
              {msg.text}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
        
        {/* Efek Loading saat Menunggu Balasan DeepSeek */}
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

      {/* Input Formulir Pengiriman Pesan */}
      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setSearchQuery && setInput(e.target.value)} // Menggunakan setter input standar
          onInput={(e: any) => setInput(e.target.value)}
          placeholder="Tulis pesan ke DeepSeek AI..."
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
