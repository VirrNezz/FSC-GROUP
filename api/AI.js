import https from 'https';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  const authKey = process.env.GEMINI_API_KEY;

  if (!authKey) {
    return res.status(500).json({ error: 'API Key belum diset di environment Vercel.' });
  }

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt tidak boleh kosong.' });
  }

  const postData = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });

  const options = {
    hostname: '://googleapis.com',
    path: '/v1beta/models/gemini-2.5-flash:generateContent',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': authKey,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const geminiReq = https.request(options, (geminiRes) => {
    let body = '';
    geminiRes.on('data', (chunk) => { body += chunk; });
    
    geminiRes.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        if (geminiRes.statusCode !== 200) {
          const errorMsg = data.error?.message || 'Gagal terhubung ke Gemini API.';
          return res.status(geminiRes.statusCode).json({ error: errorMsg });
        }

        const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, aku lagi blank nih.';
        return res.status(200).json({ text: aiReply });
      } catch (e) {
        return res.status(500).json({ error: 'Gagal memproses respons dari AI.' });
      }
    });
  });

  geminiReq.on('error', (error) => {
    return res.status(500).json({ error: error.message || 'Terjadi kesalahan pada server.' });
  });

  geminiReq.write(postData);
  geminiReq.end();
}

