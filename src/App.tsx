/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OneSignal from 'react-onesignal';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Group } from './pages/Group';
import { Admin } from './pages/Admin';

// 1. In-Memory Cache agar tidak menembak API berulang-ulang untuk teks yang sama
const translationCache: Record<string, string> = {};

// 2. Buat Language Context
const LanguageContext = createContext({
  lang: 'en',
  toggleLang: () => {},
});

export function useLang() {
  return useContext(LanguageContext);
}

// 3. Komponen Otomatis Penerjemah Tanpa Ribet Bikin Kamus Manual
export function Translate({ text }: { text: string }) {
  const { lang } = useLang();
  const [translatedText, setTranslatedText] = useState(text);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lang === 'en') {
      setTranslatedText(text);
      return;
    }

    // Cek apakah teks ini sudah pernah diterjemahkan sebelumnya di cache
    if (translationCache[text]) {
      setTranslatedText(translationCache[text]);
      return;
    }

    setLoading(true);
    // Menggunakan Google Translate API gratis lewat jalur tunggal fetch
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encodeURIComponent(text)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const result = data[0].map((x: any) => x[0]).join('');
        translationCache[text] = result; // Simpan ke cache
        setTranslatedText(result);
      })
      .catch(() => {
        setTranslatedText(text); // Fallback ke teks asli jika offline/gagal
      })
      .finally(() => setLoading(false));
  }, [lang, text]);

  return <span className={loading ? "opacity-60 animate-pulse transition-opacity duration-300" : "transition-opacity duration-300"}>{translatedText}</span>;
}

export default function App() {
  const [lang, setLang] = useState<'en' | 'id'>('en');

  // Inisialisasi OneSignal saat aplikasi dibuka
  useEffect(() => {
    OneSignal.init({
      appId: import.meta.env.VITE_ONESIGNAL_APP_ID || '97155492-540b-40ef-b9c7-72d1fed1b193',
      allowLocalhostAsSecureOrigin: true,
    });
  }, []);

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'id' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/group/:id" element={<Group />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </LanguageContext.Provider>
  );
}
