import React from 'react';
import { motion } from 'motion/react';
import { Handshake, ArrowUpRight, Globe, MessageSquare } from 'lucide-react';
import { Translate } from '../App';

// --- DATA PARTNER ---
const partnerList = [
  {
    id: 'partner-1',
    name: '『𝙁𝙎𝘼』🜲𝐒𝐇𝐀𝐑𝐊𝐧𝐨𝐱𝐳𝐚🜲💎🔥',
    avatar: '/profiles/profile-fsa.jpeg',
    description: 'Untuk masuk 『𝙁𝙎𝘼』🜲𝐒𝐇𝐀𝐑𝐊𝐧𝐨𝐱𝐳𝐚🜲 atau ⟬𝗔𝗙𝗖𝗙⟭  mohon ikut seleksi dulu ya jika ada masalah mohon lapor ke @fsa.sharknoxza.real atau ke @yanzsukfurr4 ya,terima kasih',
    category: 'COMMUNITY PARTNER',
    categoryColor: 'bg-blue-500/20 text-blue-400',
    links: [
      {
        label: 'Tiktok',
        url: 'https://www.tiktok.com/@fsa.sharknoxza.real?_r=1&_t=ZS-99ujbcAIFaG',
        icon: <svg className="w-10 h-10 mb-4 fill-pink-400" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.19c0 1.88-.41 3.77-1.42 5.33-1.05 1.62-2.65 2.87-4.5 3.44-1.9.58-4.01.44-5.8-.38-1.78-.82-3.23-2.28-4.07-4.06-.86-1.83-1.02-3.98-.46-5.91.56-1.92 1.87-3.56 3.61-4.52 1.75-.96 3.86-1.19 5.76-.64v4.3c-1.08-.43-2.31-.32-3.28.27-.97.59-1.57 1.66-1.57 2.8 0 1.13.58 2.21 1.55 2.81.97.6 2.22.71 3.3.29 1.07-.42 1.8-1.47 1.84-2.62.02-1.97.01-3.94.01-5.91V.02z"/>
      </svg>,
        btnColor: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
      },
      {
        label: 'WhatsApp (Close : 21:00 - 07:00)',
        url: 'https://chat.whatsapp.com/CWjrY9YnqhA8UEQtPIY05R', // Ganti link WhatsApp
        icon: <MessageSquare size={16} />,
        btnColor: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
      }
    ]
  },
  {
    id: 'partner-2',
    name: 'PROJECT SEVENX',
    avatar: '/profiles/profile-sevenx.jpeg',
    description: 'Masih Nunggu Owner Bales Nanti Di Isi #Mdrex',
    category: 'FSC PARTNER',
    categoryColor: 'bg-pink-500/20 text-pink-400',
    links: [
      {
        label: 'Visit Link',
        url: 'https://tiktok.com/@projectsevenx',
        icon: <svg className="w-10 h-10 mb-4 fill-pink-400" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.19c0 1.88-.41 3.77-1.42 5.33-1.05 1.62-2.65 2.87-4.5 3.44-1.9.58-4.01.44-5.8-.38-1.78-.82-3.23-2.28-4.07-4.06-.86-1.83-1.02-3.98-.46-5.91.56-1.92 1.87-3.56 3.61-4.52 1.75-.96 3.86-1.19 5.76-.64v4.3c-1.08-.43-2.31-.32-3.28.27-.97.59-1.57 1.66-1.57 2.8 0 1.13.58 2.21 1.55 2.81.97.6 2.22.71 3.3.29 1.07-.42 1.8-1.47 1.84-2.62.02-1.97.01-3.94.01-5.91V.02z"/>
      </svg>,
        btnColor: 'bg-pink-500/10 text-pink-400 hover:bg-pink-500/20'
      }
    ]
  }
];

export function Partners() {
  return (
    /* Ditambahkan pt-28 pb-16 & relative z-10 agar tidak tertutup header/nav */
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16 md:pt-36 md:pb-24 flex flex-col gap-12 relative z-10">
      
      {/* Header Halaman */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 max-w-3xl"
      >
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 self-start backdrop-blur-md">
          <Handshake size={16} className="mr-2" />
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider">
            <Translate text="Official Alliances" />
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
          <Translate text="Our Partners" />
        </h1>
        <p className="text-zinc-400 text-lg sm:text-xl font-light">
          <Translate text="Komunitas dan organisasi partner yang berkolaborasi dan tumbuh bersama Furry Society Group." />
        </p>
      </motion.div>

      {/* Grid Kartu Partner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {partnerList.map((partner, i) => (
          <motion.div
            key={partner.id}
            /* DIGANTI DARI whileInView KETIK ANIMATE AGAR LANGSUNG MUNCUL */
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="group relative bg-zinc-900/40 backdrop-blur-md hover:bg-zinc-800/60 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 transition-all duration-300 flex flex-col justify-between gap-6"
          >
            <div>
              {/* Profile Bar Atas */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <img
                    src={partner.avatar}
                    alt={partner.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-white/10 shadow-md"
                  />
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">{partner.name}</h3>
                    <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${partner.categoryColor}`}>
                      {partner.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
                <Translate text={partner.description} />
              </p>
            </div>

            {/* Link Medsos / Profil Partner */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
              {partner.links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-all px-4 py-2.5 rounded-full ${link.btnColor}`}
                >
                  {link.icon}
                  <span><Translate text={link.label} /></span>
                  <ArrowUpRight size={14} />
                </a>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
