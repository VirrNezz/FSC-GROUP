import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronDown, Users, Sparkles, PenTool, Shield, Globe, Heart, MessageSquare, Video, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { groups as staticGroups, faqs } from '../data';
import { cn } from '../lib/utils';
import { useGroups } from '../hooks/useGroups';
import { Translate } from '../App';

const iconMap: Record<string, React.ReactNode> = {
  fsc: <Users size={40} className="mb-4 text-blue-500" />,
  fc: <Sparkles size={40} className="mb-4 text-blue-400" />,
  '2ft': <PenTool size={40} className="mb-4 text-zinc-400" />
};

// --- DATA MEDIA SOSIAL (DESAIN CARD MIRIP OUR GROUPS) ---
const socialCards = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Channel',
    description: 'Join our official WhatsApp channel to get the latest announcements, updates, and community news directly.',
    url: 'https://whatsapp.com/channel/0029VbDwC12EAKWHQHBHmk0t',
    icon: <svg className="w-10 h-10 mb-4 fill-emerald-400" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
      </svg>,
    badge: 'COMMUNITY',
    badgeColor: 'bg-emerald-500/20 text-emerald-400',
    btnColor: 'bg-emerald-500/10 text-emerald-400 group-hover:text-emerald-300'
  },
  {
    id: 'tiktok',
    name: 'TikTok Official',
    description: 'Follow our official TikTok account to watch community highlights, fun edits, and event announcements.',
    url: 'https://www.tiktok.com/@furrysocietygroup?_r=1&_t=ZS-99jzCZUZZu4',
    icon: <svg className="w-10 h-10 mb-4 fill-pink-400" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.19c0 1.88-.41 3.77-1.42 5.33-1.05 1.62-2.65 2.87-4.5 3.44-1.9.58-4.01.44-5.8-.38-1.78-.82-3.23-2.28-4.07-4.06-.86-1.83-1.02-3.98-.46-5.91.56-1.92 1.87-3.56 3.61-4.52 1.75-.96 3.86-1.19 5.76-.64v4.3c-1.08-.43-2.31-.32-3.28.27-.97.59-1.57 1.66-1.57 2.8 0 1.13.58 2.21 1.55 2.81.97.6 2.22.71 3.3.29 1.07-.42 1.8-1.47 1.84-2.62.02-1.97.01-3.94.01-5.91V.02z"/>
      </svg>,
    badge: 'OFFICIAL',
    badgeColor: 'bg-pink-500/20 text-pink-400',
    btnColor: 'bg-pink-500/10 text-pink-400 group-hover:text-pink-300'
  }
];

export function Home() {
  const { groups: liveGroups } = useGroups();

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 lg:py-32 flex flex-col gap-16 md:gap-24 lg:gap-32">
      {/* Hero Section */}
      <section className="min-h-[60vh] md:min-h-[50vh] flex flex-col justify-center items-start">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6 md:mb-8 backdrop-blur-md">
            <Sparkles size={16} className="mr-2" />
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider">
              <Translate text="Welcome to the Community" />
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-9xl font-extrabold tracking-tighter leading-[1.1] md:leading-[1] mb-6 md:mb-8">
            FSG <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
              (Furry Society Group)
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-zinc-400 max-w-3xl leading-relaxed font-light">
            <Translate text="Furry Society: We are Furr, Together We Can!!" />
          </p>
        </motion.div>
      </section>

      {/* Explanatory Cards */}
      <section className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[
            { icon: <Shield size={24} className="text-blue-400"/>, title: "Safe & Inclusive", desc: "Our moderation team ensures a welcoming space free from toxicity, where everyone can express their true selves safely." },
            { icon: <Globe size={24} className="text-indigo-400"/>, title: "Indonesian Network", desc: "Connect with enthusiasts from around the indonesia. We bridge the gap between cultures and shared passions." },
            { icon: <Heart size={24} className="text-pink-400"/>, title: "Creative Hub", desc: "From art and design to storytelling and world-building, we support creatives at every step of their journey." }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 md:mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">
                <Translate text={item.title} />
              </h3>
              <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
                <Translate text={item.desc} />
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Groups Section */}
      <section className="w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col gap-8 md:gap-12"
        >
          <div className="flex flex-col gap-3 md:gap-4">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              <Translate text="Our Groups" />
            </h2>
            <div className="h-1 w-16 md:w-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {Object.values(staticGroups).map((staticGroup, i) => {
              const group = { ...staticGroup, ...liveGroups[staticGroup.id] };
              return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-zinc-900/40 backdrop-blur-md hover:bg-zinc-800/60 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 transition-all duration-300 flex flex-col"
              >
                <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-2xl bg-white/5 flex justify-between w-full">
                  <div>{iconMap[group.id]}</div>
                  <div className={cn("px-3 py-1 rounded-full text-xs font-bold self-start", group.status === 'OPEN' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
                    {group.status}
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 md:mb-3">{group.name}</h3>
                <p className="text-sm md:text-base lg:text-lg text-zinc-400 mb-8 md:mb-10 flex-1 leading-relaxed line-clamp-3">
                  <Translate text={group.description} />
                </p>
                
                <Link
                  to={`/group/${group.id}`}
                  className="inline-flex items-center text-xs sm:text-sm font-bold tracking-widest uppercase text-blue-400 group-hover:text-blue-300 transition-colors bg-blue-500/10 px-5 md:px-6 py-2 md:py-3 rounded-full self-start"
                >
                  <Translate text="Go to page" />
                  <motion.span
                    className="ml-2 inline-block"
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                  >
                    →
                  </motion.span>
                </Link>
              </motion.div>
            )})}
          </div>
        </motion.div>
      </section>

      {/* Social Media Section (KARTU BESAR PAS DI BAWAH OUR GROUPS) */}
      <section className="w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col gap-8 md:gap-12"
        >
          <div className="flex flex-col gap-3 md:gap-4">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              <Translate text="Our Social Media" />
            </h2>
            <div className="h-1 w-16 md:w-24 bg-gradient-to-r from-emerald-500 to-pink-500 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {socialCards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-zinc-900/40 backdrop-blur-md hover:bg-zinc-800/60 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-2xl bg-white/5 flex justify-between w-full items-start">
                    <div>{card.icon}</div>
                    <div className={cn("px-3 py-1 rounded-full text-xs font-bold self-start uppercase tracking-wider", card.badgeColor)}>
                      {card.badge}
                    </div>
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 md:mb-3">
                    <Translate text={card.name} />
                  </h3>
                  <p className="text-sm md:text-base lg:text-lg text-zinc-400 mb-8 md:mb-10 leading-relaxed">
                    <Translate text={card.description} />
                  </p>
                </div>

                <a
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center text-xs sm:text-sm font-bold tracking-widest uppercase transition-colors px-5 md:px-6 py-2 md:py-3 rounded-full self-start",
                    card.btnColor
                  )}
                >
                  <Translate text="Visit Link" />
                  <motion.span
                    className="ml-2 inline-block"
                    initial={{ x: 0, y: 0 }}
                    whileHover={{ x: 3, y: -3 }}
                  >
                    <ArrowUpRight size={16} />
                  </motion.span>
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="w-full max-w-4xl mx-auto pb-16 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col gap-8 md:gap-12"
        >
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 md:mb-6">FAQ</h2>
            <p className="text-lg md:text-xl text-zinc-400">
              <Translate text="Common questions about our communities." />
            </p>
          </div>

          <div className="flex flex-col gap-4 md:gap-6">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number; key?: React.Key }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="border border-white/10 rounded-[1.25rem] md:rounded-[1.5rem] overflow-hidden bg-white/5 backdrop-blur-md"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-6 md:p-8 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-bold text-lg md:text-xl pr-4">
          <Translate text={question} />
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: "spring", stiffness: 300 }}>
          <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-zinc-500" />
        </motion.div>
      </button>
      
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="p-6 pt-0 md:p-8 md:pt-0 text-zinc-400 leading-relaxed text-base md:text-lg">
          <Translate text={answer} />
        </p>
      </motion.div>
    </motion.div>
  );
}
