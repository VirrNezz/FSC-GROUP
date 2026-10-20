
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { prompt } = req.body || {};

    // Gunakan secret server-side saja.
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY belum diatur di Vercel.",
      });
    }

    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        error: "Prompt harus berupa teks dan tidak boleh kosong.",
      });
    }

    const nowWIB = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "full",
      timeStyle: "medium",
    });

    // Endpoint Gemini Developer API dari Google AI Studio.
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/` +
      `${encodeURIComponent(model)}:generateContent`;

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text:
                "Kamu adalah asisten AI yang cerdas dan mendalam untuk Furry Society Group. " +
                `Waktu saat ini di Jakarta adalah ${nowWIB}. ` +
                "Gunakan Google Search untuk pertanyaan yang membutuhkan informasi aktual. " +
                "Jawab secara jelas, akurat, dan sesuai konteks pengguna.",
            },
          ],
        },
        tools: [{ googleSearch: {} }],
        contents: [
          {
            role: "user",
            parts: [{ text: prompt.trim() }],
          },
        ],
      }),
    });

    const data = await geminiRes.json().catch(() => null);

    if (!geminiRes.ok) {
      // Jangan tampilkan API key atau seluruh detail internal ke pengguna.
      console.error("Gemini API error:", {
        status: geminiRes.status,
        message: data?.error?.message,
        statusName: data?.error?.status,
        model,
      });

      return res.status(geminiRes.status).json({
        error:
          data?.error?.message ||
          `Gemini API gagal dengan status ${geminiRes.status}.`,
      });
    }

    const parts = data?.candidates?.[0]?.content?.parts;

    const aiReply = Array.isArray(parts)
      ? parts
          .filter(
            (part) =>
              typeof part.text === "string" && !part.thought
          )
          .map((part) => part.text)
          .join("\n")
      : "";

    if (!aiReply.trim()) {
      console.error("Gemini returned no text:", {
        model,
        finishReason: data?.candidates?.[0]?.finishReason,
        promptFeedback: data?.promptFeedback,
      });

      return res.status(502).json({
        error: "Gemini tidak menghasilkan jawaban teks. Silakan coba lagi.",
      });
    }

    return res.status(200).json({
      text: aiReply,
    });
  } catch (error) {
    console.error("AI server error:", error);

    return res.status(500).json({
      error: "Terjadi kesalahan internal pada server AI.",
    });
  }
}

