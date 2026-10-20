export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    const authKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!authKey) {
      return res.status(500).json({ error: 'API Key belum diset di environment Vercel.' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt tidak boleh kosong.' });
    }

    // Mendapatkan waktu aktual Jakarta secara real-time
    const nowWIB = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "full", timeStyle: "medium" });

    // Menggunakan endpoint Gemini 3 series terbaru (gemini-3.8-flash)
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': authKey
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ 
              text: `Kamu adalah asisten AI dari lini Gemini 3 yang sangat cerdas, responsif, dan mendalam untuk Furry Society Group. Waktu saat ini di Jakarta adalah ${nowWIB}. Gunakan kemampuan pencarian Google (Google Search) secara aktif untuk menjawab pertanyaan apa pun yang memerlukan informasi valid, data aktual, atau waktu real-time dari internet.` 
            }]
          },
          // Mengaktifkan Google Search Grounding resmi untuk pencarian internet
          tools: [
            {
              google_search: {}
            }
          ],
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ]
        }),
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      const errorMsg = data.error?.message || 'Gagal terhubung ke Gemini API.';
      return res.status(geminiRes.status).json({ error: errorMsg });
    }

    const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, aku lagi blank nih.';

    return res.status(200).json({ text: aiReply });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Terjadi kesalahan pada server.' });
  }
}
