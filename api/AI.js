import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    const authKey = process.env.GEMINI_API_KEY;

    // Validasi API Key
    if (!authKey) {
      return res.status(500).json({ error: 'API Key belum diset di environment Vercel.' });
    }

    // Validasi Prompt
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt tidak boleh kosong.' });
    }

    // Inisialisasi SDK resmi menggunakan kunci AQ Anda
    const ai = new GoogleGenAI({ apiKey: authKey });

    // Panggil model generasi terbaru
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // Ambil teks balasan dengan aman lewat properti .text bawaan SDK
    const aiReply = response.text || 'Maaf, aku lagi blank nih.';

    return res.status(200).json({ text: aiReply });
  } catch (error) {
    // Tangkap error jika terjadi kendala pada serverless function
    return res.status(500).json({ error: error.message || 'Terjadi kesalahan pada server.' });
  }
}

