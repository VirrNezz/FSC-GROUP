/**
 * POST /api/broadcast-notification
 *
 * Sends a OneSignal push broadcast on behalf of a logged-in FSG admin.
 *
 * This handler is the ONLY place that ever touches ONESIGNAL_REST_API_KEY.
 * That key never ships to the browser and never travels through client-side
 * code, unlike the previous implementation which read
 * `import.meta.env.VITE_ONESIGNAL_REST_API_KEY` in AdminPanel.tsx (any env
 * var prefixed with VITE_ gets inlined into the public JS bundle by Vite).
 *
 * Works unmodified as:
 *  - a Vercel Serverless Function (this file, deployed from /api)
 *  - an Express route handler (see server.js, which imports this file)
 *
 * Required environment variables (server-only, do NOT prefix with VITE_):
 *  - ONESIGNAL_REST_API_KEY   OneSignal REST API key (secret)
 *  - ONESIGNAL_APP_ID         OneSignal App ID (falls back to VITE_ONESIGNAL_APP_ID)
 *  - ADMIN_EMAILS             optional comma-separated allowlist override
 *
 * Also reads VITE_FIREBASE_API_KEY (already present for the client SDK) to
 * verify the caller's Firebase ID token server-side via Google's Identity
 * Toolkit REST API — no firebase-admin / service account needed.
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
 * Verifies a Firebase ID token using Google's Identity Toolkit REST API.
 * Google's servers validate the signature and expiry; we just read the
 * result. Returns the verified email, or null if the token is invalid.
 */
async function verifyFirebaseIdToken(idToken) {
  const firebaseApiKey = process.env.VITE_FIREBASE_API_KEY;
  if (!firebaseApiKey) {
    throw new Error('Server misconfiguration: VITE_FIREBASE_API_KEY is not set');
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
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ---- 1. Require a Firebase ID token ----
  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!idToken) {
    return res.status(401).json({ error: 'Missing Authorization bearer token.' });
  }

  let email;
  try {
    email = await verifyFirebaseIdToken(idToken);
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(500).json({ error: 'Server misconfiguration.' });
  }

  if (!email) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }

  // ---- 2. Only allowlisted admins may broadcast ----
  const allowlist = getAdminAllowlist();
  if (!allowlist.includes(email.toLowerCase())) {
    return res.status(403).json({ error: 'This account is not authorized to send broadcasts.' });
  }

  // ---- 3. Validate the payload ----
  const { category, title, message } = req.body || {};

  if (typeof title !== 'string' || typeof message !== 'string' || !title.trim() || !message.trim()) {
    return res.status(400).json({ error: 'Title and message are required.' });
  }
  if (title.length > MAX_TITLE_LENGTH || message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: 'Title or message is too long.' });
  }

  const safeCategory = ALLOWED_CATEGORIES.includes(category) ? category : '[ANNOUNCEMENT]';

  // ---- 4. Send via OneSignal using the SERVER-ONLY secret ----
  const restApiKey = process.env.ONESIGNAL_REST_API_KEY;
  const appId = process.env.ONESIGNAL_APP_ID || process.env.VITE_ONESIGNAL_APP_ID;

  if (!restApiKey || !appId) {
    console.error('Server misconfiguration: OneSignal env vars are missing.');
    return res.status(500).json({ error: 'Notification service is not configured.' });
  }

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
        : 'OneSignal rejected the request.';
      return res.status(502).json({ error: detail });
    }

    return res.status(200).json({ success: true, id: osData.id });
  } catch (err) {
    console.error('OneSignal broadcast failed:', err);
    return res.status(502).json({ error: 'Failed to reach the notification service.' });
  }
}
