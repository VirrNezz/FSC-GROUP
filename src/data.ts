export const groups = {
  fsc: {
    id: "fsc",
    name: "FSC",
    fullName: "Furry Society Clan",
    description: "FSC is a welcoming space for all members of the community. We focus on creativity, art, and building lasting friendships through shared interests and collaborative projects.",
    vision: "To be the most inclusive and inspiring hub for furry enthusiasts worldwide.",
    mission: "Provide a safe, engaging, and supportive environment where individuals can express themselves freely and connect with like-minded peers.",
    themeColors: { bg: "#f8fafc", text: "#0f172a", accent: "#475569" }, // putih abu kebiruan
    status: "OPEN",
    joinLink: "#join-fsc",
    staff: [
      { name: "kyshoo", role: "Owner", image: "/profiles/kyshoo.png" },
      { name: "kaishii", role: "Co-Owner", image: "/profiles/kaishii.png" },
      { name: "Lewis Welby", role: "Co-Owner", image: "/profiles/alzelewis.png" },
      { name: "nesi", role: "Supervisor", image: "/profiles/nesi.png" },
      { name: "rezzx", role: "Supervisor", image: "/profiles/rezzx.png" },
      { name: "Safran", role: "Supervisor", image: "/profiles/safran.png" },
      { name: "Yanzkyy", role: "Supervisor", image: "/profiles/yanzkyy.png" },
      { name: "Leonwangy", role: "Supervisor", image: "/profiles/leonwangy.png" },
      { name: "Reki", role: "Supervisor", image: "/profiles/reki.png" }
    ]
  },
  fc: {
    id: "fc",
    name: "FC",
    fullName: "Furry Creator",
    description: "The central hub for all things related to the fandom. FC is dedicated to organizing large-scale virtual events, conventions discussions, and providing resources for newcomers.",
    vision: "To be the central pillar of support and entertainment for the fandom.",
    mission: "Organize impactful events and provide comprehensive resources to educate, entertain, and unite the community.",
    themeColors: { bg: "#020617", text: "#e0f2fe", accent: "#0284c7" }, // Biru dan hitam sapphire
    status: "CLOSED",
    joinLink: "#join-fc",
    staff: [
      { name: "Lewis Welby", role: "Owner", image: "/profiles/alzelewis.png" },
      { name: "nesi", role: "Co-Owner", image: "/profiles/nesi.png" },
      { name: "kaishii", role: "Supervisor", image: "/profiles/kaishii.png" }
    ]
  },
  "2ft": {
    id: "2ft",
    name: "2FT",
    fullName: "Furry Famous Team",
    description: "A specialized group focusing on writing, storytelling, and world-building within the community. We host weekly writing prompts and narrative workshops.",
    vision: "To elevate the art of storytelling and narrative creation in the fandom.",
    mission: "Cultivate a dedicated space for writers to share, critique, and improve their craft collaboratively.",
    themeColors: { bg: "#000000", text: "#ffffff", accent: "#737373" }, // hitam putih
    status: "OPEN",
    joinLink: "#join-2ft",
    staff: [
      { name: "nesi", role: "Owner", image: "/profiles/nesi.png" },
      { name: "kaishii", role: "Co-Owner", image: "/profiles/kaishii.png" },
      { name: "rezzx", role: "Co-Owner", image: "/profiles/rezzx.png" },
      { name: "raihann", role: "Supervisor", image: "/profiles/raihann.png" }
    ]
  }
};

export const adminsData = [
  {
    id: "a1",
    name: "kaishii",
    image: "/profiles/kaishii.png",
    bio: "Owner of FSG. Head of infrastructure and server maintenance. Ensures all community platforms remain stable and secure.",
    socials: { ig: "https://instagram.com", telegram: "https://t.me" }
  },
  {
    id: "a2",
    name: "nesi",
    image: "/profiles/nesi.png",
    bio: "Lead developer for the FSG website. Reach out with bug reports or feature suggestions.",
    socials: { telegram: "https://t.me" }
  }
];

export const faqs = [
  { question: "What is FSG?", answer: "The Furry Society Group is a community that serves as a hub for furry enthusiasts to gather, share their work, build friendships, and foster creativity. The community upholds mutual respect, inclusivity, and collaboration, enabling every member to express themselves within a positive, safe, and supportive environment." },
  { question: "How do I join a specific group?", answer: "Navigate to the specific group's page from the home screen and click the 'Join' link if the status is OPEN." },
  { question: "Can I be in multiple groups?", answer: "Yes, provided you meet the requirements and can actively participate in each." },
  { question: "Who do I contact for website issues?", answer: "Please visit the Admin page and reach out to one of our developers or moderators via their provided social links." }
];
