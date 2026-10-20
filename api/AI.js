export default async function handler(req, res) {
  // 1. Validasi Method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    const authKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    // 2. Proteksi jika API Key kosong
    if (!authKey) {
      return res.status(500).json({ error: 'API Key belum diatur di Environment Variables Vercel.' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt tidak boleh kosong.' });
    }

    const nowWIB = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "full", timeStyle: "medium" });
    
    // 3. Konfigurasi Header berdasarkan jenis Kunci API (AQ vs AIza)
    const isBearerToken = authKey.startsWith('AQ');
    const headers = { 
      'Content-Type': 'application/json' 
    };

    if (isBearerToken) {
      headers['Authorization'] = `Bearer ${authKey}`;
    } else {
      headers['X-Goog-Api-Key'] = authKey;
    }

    // 4. Request ke Endpoint Resmi Gemini 2.5 Flash
    const geminiRes = await fetch(
      'https://googleapis.com',
      {
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
      }
    );

    // 5. Cek status respons HTTP Google Gemini
    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return res.status(geminiRes.status).json({ 
        error: `Google Gemini API Error (Status ${geminiRes.status}): ${errText}` 
      });
    }

    const data = await geminiRes.json();

    // 6. Parsing data secara aman menggunakan pemeriksaan properti bertahap
    if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      const aiReply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ text: aiReply });
    }

    return res.status(500).json({ error: 'Struktur respons dari Gemini tidak sesuai atau kosong.', rawData: data });

  } catch (error) {
    // Mengembalikan pesan error asli ke frontend agar bisa dibaca langsung di konsol browser
    return res.status(500).json({ 
      error: 'Terjadi kegagalan internal pada Serverless Function.',
      details: error.message || String(error)
    });
  }
}

