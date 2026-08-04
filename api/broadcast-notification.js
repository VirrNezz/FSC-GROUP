/**
 * POST /api/broadcast-notification
 *
 * Handler khusus backend untuk mengirim push broadcast OneSignal.
 * Menggunakan ONESIGNAL_REST_API_KEY secara aman di sisi server.
 */

const DEFAULT_ADMIN_EMAILS = ['ochalopha@gmail.com', 'furrsocietyclan@gmail.com'];
const ALLOWED_CATEGORIES = ['[ANNOUNCEMENT]', '[NEW GROUP]', '[EVENT]', '[UPDATE]'];
const MAX_TITLE_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 500;

function getAdminAllowlist() {
  const raw = process.env.ADMIN_EMAILS;
  if (!raw) return DEFAULT_ADMIN_EMAILS;
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Verifikasi Firebase ID token lewat Identity Toolkit REST API Google
 */
async function verifyFirebaseIdToken(idToken) {
  const firebaseApiKey = process.env.VITE_FIREBASE_API_KEY;
  if (!firebaseApiKey) {
    throw new Error('Server error: VITE_FIREBASE_API_KEY belum dipasang di Vercel.');
  }

  const verifyRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  );

  const verifyData = await verifyRes.json().catch(() => null);

  if (!verifyRes.ok || !verifyData?.users?.[0]?.email) {
    return null;
  }

  return verifyData.users[0].email;
}

export default async function handler(req, res) {
  // Hanya menerima HTTP POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Cek Token Autentikasi Firebase
  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!idToken) {
    return res.status(401).json({ error: 'Akses ditolak. Token autentikasi tidak ditemukan.' });
  }

  let email;
  try {
    email = await verifyFirebaseIdToken(idToken);
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(500).json({ error: err.message || 'Konfigurasi Firebase server belum lengkap.' });
  }

  if (!email) {
    return res.status(401).json({ error: 'Sesi login tidak valid atau kadaluarsa. Silakan login ulang.' });
  }

  // 2. Cek Hak Akses Admin
  const allowlist = getAdminAllowlist();
  if (!allowlist.includes(email.toLowerCase())) {
    return res.status(403).json({ error: 'Akun kamu tidak memiliki izin untuk mengirim broadcast.' });
  }

  // 3. Validasi Body Request (Input User)
  let bodyData = req.body;
  if (typeof bodyData === 'string') {
    try {
      bodyData = JSON.parse(bodyData);
    } catch (e) {
      bodyData = {};
    }
  }

  const { category, title, message } = bodyData || {};

  if (typeof title !== 'string' || typeof message !== 'string' || !title.trim() || !message.trim()) {
    return res.status(400).json({ error: 'Judul dan pesan tidak boleh kosong.' });
  }
  if (title.length > MAX_TITLE_LENGTH || message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: 'Judul atau pesan terlalu panjang.' });
  }

  const safeCategory = ALLOWED_CATEGORIES.includes(category) ? category : '[ANNOUNCEMENT]';

  // 4. Ambil Key OneSignal dari Environment Variables
  const restApiKey = process.env.ONESIGNAL_REST_API_KEY;
  const appId = process.env.ONESIGNAL_APP_ID || process.env.VITE_ONESIGNAL_APP_ID || '97155492-540b-40ef-b9c7-72d1fed1b193';

  if (!restApiKey || !appId) {
    console.error('Server error: Variabel ONESIGNAL_REST_API_KEY atau APP_ID belum diisi di Vercel.');
    return res.status(500).json({ error: 'Layanan notifikasi belum dikonfigurasi di server.' });
  }

  // 5. Kirim Request ke OneSignal API
  try {
    const osRes = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Basic ${restApiKey}`,
      },
      body: JSON.stringify({
        app_id: appId,
        included_segments: ['All'],
        headings: { en: `${safeCategory} ${title.trim()}` },
        contents: { en: message.trim() },
        url: 'https://furry-society-group.my.id',
      }),
    });

    const osData = await osRes.json().catch(() => ({}));

    if (!osRes.ok || osData.errors) {
      const detail = osData.errors
        ? Array.isArray(osData.errors)
          ? osData.errors.join(', ')
          : JSON.stringify(osData.errors)
        : 'OneSignal menolak permintaan.';
      // Mengubah status HTTP dari 502 ke 400 agar pesan penolakan OneSignal tampil transparan di UI Admin
      return res.status(400).json({ error: `OneSignal Error: ${detail}` });
    }

    // Response sukses
    return res.status(200).json({ success: true, id: osData.id });
  } catch (err) {
    console.error('OneSignal broadcast error:', err);
    return res.status(500).json({ error: 'Gagal terhubung ke server OneSignal.' });
  }
}
