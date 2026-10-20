export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    // Mendukung kedua nama environment variable agar tidak nyasar
    const authKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!authKey) {
      return res.status(500).json({ error: 'API Key belum diset di environment Vercel.' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt tidak boleh kosong.' });
    }

    const nowWIB = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "full", timeStyle: "medium" });

    // Karena token kamu berawalan 'AQ', kita gunakan Bearer Token authorization
    const isBearerToken = authKey.startsWith('AQ');
    const headers = {
      'Content-Type': 'application/json',
    };

    if (isBearerToken) {
      headers['Authorization'] = `Bearer ${authKey}`;
    } else {
      headers['X-Goog-Api-Key'] = authKey;
    }

    // Menggunakan model terbaru gemini-2.5-flash untuk performa terbaik
    const geminiRes = await fetch(
      `https://googleapis.com`,
      {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          system_instruction: {
            parts: [{ 
              text: `Kamu adalah asisten AI yang cerdas dan mendalam untuk Furry Society Group. Waktu saat ini di Jakarta adalah ${nowWIB}. Gunakan Google Search secara aktif untuk menjawab pertanyaan yang memerlukan data aktual.` 
            }]
          },
          // Format pemanggilan alat pencarian (Google Search Grounding) yang tepat
          tools: [
            {
              googleSearch: {}
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
      return res.status(500).json({ error: errorMsg });
    }

    const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, aku lagi blank nih.';

    return res.status(200).json({ text: aiReply });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Terjadi kesalahan pada server.' });
  }
}

