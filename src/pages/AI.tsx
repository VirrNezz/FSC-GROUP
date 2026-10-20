import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Translate } from '../App';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export function AI() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: 'model', text: 'Halo! Aku asisten AI siap menemanimu ngobrol di Furry Society Group. Ada yang ingin diobrolin? :3' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: userMessage,
        // Konfigurasi Personality / Karakter AI di sini!
        config: {
          systemInstruction: "Kamu adalah asisten AI resmi untuk komunitas Furry Society Group. Karaktermu ramah, santai, suka menggunakan ekspresi imut atau emotikon kucing/furry (seperti :3, >w<, hehee), dan selalu siap membantu obrolan apa pun dengan hangat.",
        }
      });

      const aiReply = response.text || 'Maaf, aku lagi blank nih.';
      setMessages(prev => [...prev, { role: 'model', text: aiReply }]);
    } catch (err) {
      console.error('Error AI:', err);
      setMessages(prev => [...prev, { role: 'model', text: 'Duh, koneksi ke server AI lagi kendala nih.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-36 flex flex-col h-[85vh] relative z-10">
      
      {/* Header Title */}
      <div className="flex items-center gap-3 mb-4 bg-zinc-900/60 border border-white/10 p-4 rounded-3xl backdrop-blur-md shadow-lg">
        <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
          <Sparkles size={20} />
        </div>
        <div>
          <h2 className="text-base font-bold text-white"><Translate text="Chat AI" /></h2>
          <p className="text-xs text-zinc-400">Ngobrol seru dan tanyakan apa saja dengan Gemini AI.</p>
        </div>
      </div>

      {/* Kotak Riwayat Chat */}
      <div className="flex-1 overflow-y-auto bg-zinc-950/80 border border-white/10 rounded-3xl p-4 sm:p-6 flex flex-col gap-4 mb-4 backdrop-blur-md shadow-2xl custom-scrollbar">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex items-start gap-3 max-w-[85%] sm:max-w-[75%] ${
              msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
              msg.role === 'user' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-zinc-900 border-white/10 text-purple-400'
            }`}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>

            <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
              msg.role === 'user' 
                ? 'bg-purple-600 text-white rounded-tr-none' 
                : 'bg-zinc-900/90 border border-white/10 text-zinc-200 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-3 self-start text-xs text-zinc-400 italic bg-zinc-900/40 p-3 rounded-2xl border border-white/5">
            <Bot size={14} className="animate-pulse text-purple-400" />
            <span>AI sedang merangkai kata...</span>
          </div>
        )}
      </div>

      {/* Form Input Chat */}
      <form onSubmit={handleSendMessage} className="flex gap-2 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pesan atau tanyakan sesuatu..."
          className="flex-1 bg-zinc-900/80 border border-white/10 pl-5 pr-4 py-3.5 rounded-full text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500 backdrop-blur-md shadow-xl transition-all"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-xs sm:text-sm font-bold transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-2 shrink-0"
        >
          <span>Kirim</span>
          <Send size={14} />
        </button>
      </form>

    </div>
  );
}
