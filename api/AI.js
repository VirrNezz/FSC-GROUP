export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    const authKey = process.env.GEMINI_API_KEY;

    if (!authKey) {
      return res.status(500).json({ error: 'API Key belum diset di environment Vercel.' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt tidak boleh kosong.' });
    }

    // Menggunakan URL fetch yang valid dan bersih
    const geminiRes = await fetch(
      'https://googleapis.com',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': authKey
        },
        body: JSON.stringify({
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

    // Membaca teks balasan AI dengan pengecekan bertahap yang aman dari error undefined
    let aiReply = 'Maaf, aku lagi blank nih.';
    if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      aiReply = data.candidates[0].content.parts[0].text;
    }

    return res.status(200).json({ text: aiReply });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Terjadi kesalahan pada server.' });
  }
}

