export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body || {};
    // Pakai GEMINI_API_KEY (tanpa prefix VITE_) supaya key tidak ikut ke bundle frontend
    const authKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

    if (!authKey) {
      return res.status(500).json({ error: 'API Key belum diatur di Environment Variables Vercel.' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt tidak boleh kosong.' });
    }

    const nowWIB = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    // Key berawalan "AQ" = Vertex AI express mode, selain itu = Gemini API biasa (AIza...)
    const isVertexKey = authKey.startsWith('AQ');

    const url = isVertexKey
      ? `https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:generateContent`
      : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    // Kedua jenis key dikirim lewat header yang sama
    const headers = {
      'Content-Type': 'application/json',
      'x-goog-api-key': authKey,
    };

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: `Kamu adalah asisten AI yang cerdas dan mendalam untuk Furry Society Group. Waktu saat ini di Jakarta adalah ${nowWIB}. Gunakan Google Search secara aktif untuk menjawab pertanyaan yang memerlukan data aktual.`,
            },
          ],
        },
        tools: [{ googleSearch: {} }],
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return res.status(geminiRes.status).json({
        error: `Google API Error (Status ${geminiRes.status}) di ${model}: ${errText.slice(0, 500)}`,
      });
    }

    const data = await geminiRes.json();

    // Gabungkan semua part teks (hasil Google Search grounding bisa terpecah jadi beberapa part)
    const parts = data?.candidates?.[0]?.content?.parts;
    const aiReply = Array.isArray(parts)
      ? parts.filter((p) => p.text && !p.thought).map((p) => p.text).join('')
      : '';

    if (aiReply) {
      return res.status(200).json({ text: aiReply });
    }

    return res.status(500).json({ error: 'Struktur respons dari Gemini tidak sesuai.', rawData: data });
  } catch (error) {
    return res.status(500).json({
      error: 'Terjadi kegagalan internal pada Serverless Function.',
      details: error.message || String(error),
    });
  }
}
