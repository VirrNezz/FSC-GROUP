export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    const authKey = process.env.VITE_GEMINI_API_KEY;

    if (!authKey) {
      return res.status(500).json({ error: 'API Key belum diset di environment Vercel.' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt tidak boleh kosong.' });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`,
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

    const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, aku lagi blank nih.';

    return res.status(200).json({ text: aiReply });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Terjadi kesalahan pada server.' });
  }
}
