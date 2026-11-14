export type Fact = { k: string; v: number; w: string }

export type Service = {
  no: string
  ref: string
  title: string
  kicker: string
  tagline: string
  body: string[]
  serving: string
  facts: Fact[]
  ingredients: string
  note: string
  storage: string
  dot: string
  chip: string
}

// literal width classes so Tailwind can see them
const F = {
  ideas: { k: "Ideas", v: 94, w: "w-[94%]" },
  nerve: { k: "Nerve", v: 88, w: "w-[88%]" },
  craft: { k: "Craft", v: 91, w: "w-[91%]" },
  type: { k: "Typography", v: 86, w: "w-[86%]" },
  motion: { k: "Motion", v: 97, w: "w-[97%]" },
  screen: { k: "Screen friendly", v: 99, w: "w-[99%]" },
  chaos: { k: "Controlled chaos", v: 73, w: "w-[73%]" },
  noise: { k: "Noise", v: 82, w: "w-[82%]" },
  system: { k: "Systems", v: 90, w: "w-[90%]" },
  humor: { k: "Sense of humour", v: 77, w: "w-[77%]" },
  boring: { k: "Boring", v: 0, w: "w-[0%]" },
}

export const SERVICES: Service[] = [
  {
    no: "01",
    ref: "PNT-001",
    title: "Brand identity",
    kicker: "Sparkling ideas",
    tagline: "Pop the lid on who you are",
    body: [
      "Every brand we make starts as a single fizzy idea — a concept strong enough to carry a name, a voice and a whole visual world without going flat.",
      "We don't do logos that sit still for thirty years. We build identities that move, react and keep their bubbles on every screen they land on.",
    ],
    serving: "330 ml",
    facts: [F.ideas, F.nerve, F.craft, F.type, F.chaos, F.boring],
    ingredients: "Concept, naming, strategy, verbal identity, logo systems, positioning.",
    note: "* Best served before your competitors notice.",
    storage: "Serve chilled",
    dot: "bg-hot",
    chip: "bg-hot text-ink",
  },
  {
    no: "02",
    ref: "PNT-002",
    title: "Visual systems",
    kicker: "Whole fresh type",
    tagline: "Rules made to be poured",
    body: [
      "A brand today is a language, not a logo. We design flexible systems — grids, type, colour, motion rules — that let a team speak fluently anywhere.",
      "Typography is our dairy: the base of everything. We push it until it carries the personality on its own.",
    ],
    serving: "1 L",
    facts: [F.system, F.type, F.craft, F.screen, F.ideas, F.boring],
    ingredients: "Type systems, colour, layout grids, iconography, motion guidelines.",
    note: "* Keep refrigerated. Consistency improves with use.",
    storage: "Keep refrigerated",
    dot: "bg-cobalt",
    chip: "bg-cobalt text-white",
  },
  {
    no: "03",
    ref: "PNT-003",
    title: "Interactive web",
    kicker: "Squeeze the screen",
    tagline: "Motion is the main ingredient",
    body: [
      "A website is the loudest room your brand owns. We design and build immersive, tactile sites — scroll stories, 3D, playful interfaces — that people actually remember.",
      "Design and code come out of the same tube here, so nothing gets lost between the idea and the browser.",
    ],
    serving: "200 ml",
    facts: [F.motion, F.screen, F.craft, F.chaos, F.nerve, F.boring],
    ingredients: "Creative coding, WebGL & 3D, UX/UI, custom front-end, e-commerce.",
    note: "* Contains the recommended daily dose of scrolling.",
    storage: "Squeeze from the bottom",
    dot: "bg-volt",
    chip: "bg-volt text-ink",
  },
  {
    no: "04",
    ref: "PNT-004",
    title: "Bold campaigns",
    kicker: "Daily dose of noise",
    tagline: "Take one idea, call us in the morning",
    body: [
      "Communication is a conversation, and nobody remembers the polite guest. We make campaigns that take small risks to earn big reactions.",
      "Serious doesn't mean solemn. We'd rather make people smile, share and come back for a refill.",
    ],
    serving: "60 caps",
    facts: [F.noise, F.humor, F.ideas, F.nerve, F.screen, F.boring],
    ingredients: "Storytelling, social campaigns, launches, branded content, art direction.",
    note: "* May cause sudden brand awareness.",
    storage: "Keep out of reach of boring",
    dot: "bg-bubble",
    chip: "bg-bubble text-ink",
  },
]

export const CLIENTS = [
  "Nordlicht", "Oddbird", "Mondo Radio", "Kiosko", "Fable & Co", "Velvet Hammer", "Plaza Nova", "Lumen Labs",
  "Trampolin", "Holo", "Bodega 22", "Sundae", "Gravel", "Neón Club",
]

export const WORKS = [
  { name: "Kiosko Nights", type: "Identity · Web", year: "2026", dot: "bg-hot" },
  { name: "Lumen Labs", type: "Visual system", year: "2026", dot: "bg-cobalt" },
  { name: "Velvet Hammer", type: "Interactive · 3D", year: "2025", dot: "bg-volt" },
  { name: "Mondo Radio", type: "Campaign", year: "2025", dot: "bg-bubble" },
  { name: "Bodega 22", type: "Identity · Packaging", year: "2024", dot: "bg-hot" },
]
