import React, { useState, useRef, useEffect } from 'react';
import { Translate } from '../App'; // Menggunakan pembungkus translate otomatis jika dibutuhkan

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export function AI() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Halo! Aku asisten AI Furry Society Group. Ada yang bisa kubantu hari ini?' }
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

    const userMessage = input.trim();
    setInput('');
    
    // 1. Tambahkan pesan user ke UI chat
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // 2. Tembak endpoint Vercel Serverless Function yang tadi kita buat
      const response = await fetch('/api/AI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan sistem.');
      }

      // 3. Tambahkan jawaban model Gemini ke UI chat
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'model', text: data.text }
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'model', text: `Error: ${error.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto p-4">
      {/* Header Halaman AI */}
      <div className="pb-4 border-b border-gray-700 mb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          ✨ Furry Society AI Asisten
        </h1>
        <p className="text-sm text-gray-400">
          <Translate text="Powered by Gemini 2.5 Flash with Real-time Google Search Search Grounding" />
        </p>
      </div>

      {/* Box Area Obrolan Chat */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 bg-gray-900/50 rounded-xl p-4 shadow-inner border border-gray-800">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap shadow-md ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        
        {/* Efek Loading saat Menunggu Balasan Gemini */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-400 rounded-2xl rounded-tl-none px-4 py-3 text-sm border border-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
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
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanyakan sesuatu..."
          disabled={loading}
          className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all placeholder-gray-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:scale-100 text-white font-medium rounded-xl px-5 py-3 text-sm transition-all shadow-lg flex items-center justify-center"
        >
          Kirim
        </button>
      </form>
    </div>
  );
}

