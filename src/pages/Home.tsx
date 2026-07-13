import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronDown, Users, Sparkles, PenTool, Shield, Globe, Heart } from 'lucide-react';
import { useState } from 'react';
import { groups as staticGroups, faqs } from '../data';
import { cn } from '../lib/utils';
import { useGroups } from '../hooks/useGroups';
import { Translate } from '../App'; // <-- 1. IMPORT TRANSLATE DARI APP.TSX

const iconMap: Record<string, React.ReactNode> = {
  fsc: <Users size={40} className="mb-4 text-blue-500" />,
  fc: <Sparkles size={40} className="mb-4 text-blue-400" />,
  '2ft': <PenTool size={40} className="mb-4 text-zinc-400" />
};

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
              {/* 2. CUKUP BUNGKUS DENGAN <Translate text="..." /> */}
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
            <Translate text="A collaborative network of specialized communities. Explore our groups, join the conversation, and find your place." />
          </p>
        </motion.div>
      </section>

      {/* Explanatory Cards */}
      <section className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[
            { icon: <Shield size={24} className="text-blue-400"/>, title: "Safe & Inclusive", desc: "Our moderation team ensures a welcoming space free from toxicity, where everyone can express their true selves safely." },
            { icon: <Globe size={24} className="text-indigo-400"/>, title: "Global Network", desc: "Connect with enthusiasts from around the world. We bridge the gap between cultures and shared passions." },
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
                <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-2xl bg-white/5 inline-block self-start group-hover:scale-110 transition-transform duration-300 flex justify-between w-full">
                  <div>{iconMap[group.id]}</div>
                  <div className={cn("px-3 py-1 rounded-full text-xs font-bold self-start", group.status === 'OPEN' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
                    {group.status}
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 md:mb-3">{group.name}</h3>
                <p className="text-sm md:text-base lg:text-lg text-zinc-400 mb-8 md:mb-10 flex-1 leading-relaxed line-clamp-3">
                  {/* Karena deskripsi grup ditarik dari data eksternal, kita juga bisa langsung bungkus datanya di sini */}
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
