export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    const authKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!authKey) {
      return res.status(500).json({ error: 'API Key belum diatur di Environment Variables Vercel.' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt tidak boleh kosong.' });
    }

    const nowWIB = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "full", timeStyle: "medium" });
    const isBearerToken = authKey.startsWith('AQ');
    
    // PENENTUAN ENDPOINT DAN HEADER SECARA DINAMIS
    let url = '';
    const headers = { 'Content-Type': 'application/json' };

    if (isBearerToken) {
      // Jika pakai token AQ (format baru), wajib tembak endpoint internal aiplatform global
      url = `https://googleapis.com`;
      headers['Authorization'] = `Bearer ${authKey}`;
    } else {
      // Jika pakai format AIza (kunci lama), gunakan endpoint generativelanguage standar
      url = `https://googleapis.com`;
      headers['X-Goog-Api-Key'] = authKey;
    }

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        system_instruction: {
          parts: [{ 
            text: `Kamu adalah asisten AI yang cerdas dan mendalam untuk Furry Society Group. Waktu saat ini di Jakarta adalah ${nowWIB}. Gunakan Google Search secara aktif untuk menjawab pertanyaan yang memerlukan data aktual.` 
          }]
        },
        tools: [{ googleSearch: {} }],
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return res.status(geminiRes.status).json({ 
        error: `Google API Error (Status ${geminiRes.status}): ${errText}` 
      });
    }

    const data = await geminiRes.json();

    // Pengecekan data bertahap agar aman dari resiko object crash 
    if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      const aiReply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ text: aiReply });
    }

    return res.status(500).json({ error: 'Struktur respons dari Gemini tidak sesuai.', rawData: data });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Terjadi kegagalan internal pada Serverless Function.',
      details: error.message || String(error)
    });
  }
}

