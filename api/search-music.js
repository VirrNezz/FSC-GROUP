export default async function handler(req, res) {
  // Mengizinkan CORS agar frontend bisa mengakses endpoint ini
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query.q || req.body?.q;

  if (!query) {
    return res.status(400).json({ error: 'Query pencarian tidak boleh kosong.' });
  }

  try {
    // Melakukan fetch ke suggestqueries dari server-side (bebas dari blokir CORS browser)
    const response = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error('Gagal mengambil data dari Google/YouTube.');
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Terjadi kesalahan pada server.' });
  }
}
