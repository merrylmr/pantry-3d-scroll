import { useEffect, useRef, useState } from "react"
import Scene from "./Scene"
import { CLIENTS, SERVICES, WORKS, type Service } from "./content"
import { SCAN_A, SCAN_B } from "./story"

const EMAIL = "hello@pantry.studio"
const STATEMENT =
  "® Pantry is a self-service design studio stocking loud visual languages for brands that refuse to look like the box next to them on the shelf."

// ------------------------------------------------------------------ small bits
function Barcode({ seed = 1, className = "" }: { seed?: number; className?: string }) {
  const bars: { x: number; w: number }[] = []
  let s = seed * 7919
  let x = 0
  while (x < 200) {
    s = (s * 9301 + 49297) % 233280
    const w = 1 + Math.floor((s / 233280) * 4)
    s = (s * 9301 + 49297) % 233280
    const gap = 1 + Math.floor((s / 233280) * 3)
    bars.push({ x, w })
    x += w + gap
  }
  return (
    <svg viewBox="0 0 200 60" preserveAspectRatio="none" className={className} aria-hidden>
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={60} fill="currentColor" />
      ))}
    </svg>
  )
}

function Marquee({ children, className = "", anim = "animate-marquee" }: { children: React.ReactNode; className?: string; anim?: string }) {
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div className={`inline-flex w-max ${anim}`}>
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}

const reveal = "opacity-0 translate-y-6 transition-all duration-1000 ease-out data-[in=1]:opacity-100 data-[in=1]:translate-y-0"

// ------------------------------------------------------------------ preloader
function Preloader() {
  const [n, setN] = useState(0)
  const [done, setDone] = useState(false)
  useEffect(() => {
    const t0 = performance.now()
    let raf = 0
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 1500)
      setN(Math.round((1 - Math.pow(1 - k, 3)) * 100))
      if (k < 1) raf = requestAnimationFrame(step)
      else setTimeout(() => setDone(true), 250)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div
      data-done={done ? 1 : 0}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-ink p-5 font-mono text-xs uppercase text-shelf transition-transform duration-1000 ease-[cubic-bezier(.8,0,.2,1)] data-[done=1]:-translate-y-full md:p-8"
    >
      <div className="flex justify-between">
        <span>PANTRY® design goods</span>
        <span>Stocking the shelves…</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="max-w-48 leading-relaxed">Self-service studio. Limited stock. No refunds on good ideas.</span>
        <span className="font-sans text-[22vw] font-black leading-[0.8] tracking-tighter md:text-[14vw]">{String(n).padStart(3, "0")}</span>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ header
function Header({ count, sound, onSound }: { count: number; sound: boolean; onSound: () => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-4 bg-shelf/75 px-4 py-3 font-mono text-[11px] uppercase backdrop-blur-md md:px-8 md:py-4">
      <a href="#top" className="font-sans text-base font-black tracking-tight normal-case md:text-lg">
        PANTRY<sup className="text-[0.6em]">®</sup>
      </a>
      <span className="hidden md:block">Self-service design studio — open 24/7</span>
      <nav className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSound}
          className="hidden rounded-full border border-ink px-3 py-1.5 uppercase transition-colors hover:bg-ink hover:text-shelf md:block"
        >
          Sound {sound ? "on" : "off"}
        </button>
        <a href="#works" className="rounded-full border border-ink px-3 py-1.5 transition-colors hover:bg-ink hover:text-shelf">Works</a>
        <a href="#receipt" className="flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-shelf transition-colors hover:bg-hot hover:text-ink">
          Basket{" "}
          <span key={count} className="animate-pop rounded-full bg-hot px-1.5 text-ink">
            0{count}
          </span>
        </a>
      </nav>
    </header>
  )
}

// ------------------------------------------------------------------ hero
function Hero() {
  return (
    <section id="top" className="relative flex h-svh flex-col justify-between overflow-hidden pb-5 pt-16 md:pb-8 md:pt-20">
      <Marquee className="border-y border-ink py-2 font-mono text-[11px] uppercase">
        {["Authentic design goods", "Self-service studio", "Limited stock", "Consume responsibly", "One idea per project", "No refunds on good ideas", "Open 365 days"].map((t) => (
          <span key={t} className="flex items-center gap-6 pr-6">
            {t} <span className="text-hot">✦</span>
          </span>
        ))}
      </Marquee>

      <h1 className="select-none px-3 font-black uppercase leading-[0.8] tracking-[-0.06em] md:px-6">
        <span className="block text-[23vw] md:text-[19.5vw]">Design</span>
        <span className="flex items-start justify-between text-[23vw] md:text-[19.5vw]">
          Goods<sup className="mt-[2vw] text-[5vw]">®</sup>
        </span>
      </h1>

      <div className="grid grid-cols-2 items-end gap-4 px-4 font-mono text-[11px] uppercase md:grid-cols-3 md:px-8">
        <p className="leading-relaxed">
          For restless brands
          <br />
          <span className="text-ink/60">Est. 2019 · Worldwide delivery</span>
        </p>
        <p className="hidden text-center md:block">
          Scroll to stock up <span className="inline-block animate-bounce">↓</span>
        </p>
        <p className="text-right leading-relaxed normal-case md:pl-16">
          We pack identity, systems, websites and campaigns into products you can actually use.
        </p>
      </div>
    </section>
  )
}

// ------------------------------------------------------------------ statement
function Statement() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const sec = ref.current
    if (!sec) return
    const words = Array.from(sec.querySelectorAll<HTMLSpanElement>("[data-w]"))
    let raf = 0
    const run = () => {
      raf = requestAnimationFrame(run)
      const r = sec.getBoundingClientRect()
      const vh = window.innerHeight
      const p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / (r.height - vh * 0.6)))
      words.forEach((w, i) => {
        const k = Math.min(1, Math.max(0, p * 1.25 * words.length - i))
        w.style.opacity = String(0.12 + k * 0.88)
      })
    }
    raf = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <section ref={ref} data-anchor="statement" className="relative h-[190vh]">
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center gap-10 px-5 text-center">
        <span className="font-mono text-[11px] uppercase">( Please read carefully )</span>
        <p className="max-w-6xl text-[7.6vw] font-bold uppercase leading-[0.92] tracking-[-0.04em] md:text-[4.6vw]">
          {STATEMENT.split(" ").map((w, i) => (
            <span key={i} data-w className="opacity-10">
              {w}{" "}
            </span>
          ))}
        </p>
        <p className="max-w-md font-mono text-xs leading-relaxed">
          We build flexible, screen-first brands for organisations that want to push boundaries — where movement and interaction aren't extras, they're the main ingredient.
        </p>
      </div>
    </section>
  )
}

// ------------------------------------------------------------------ product sections
function FactsLabel({ s, i }: { s: Service; i: number }) {
  return (
    <div data-reveal className={`${reveal} relative w-full max-w-sm border-2 border-ink bg-shelf p-4 font-mono text-[11px] uppercase md:p-5`}>
      <div className="flex items-start justify-between border-b-8 border-ink pb-2">
        <div>
          <p className="font-sans text-3xl font-black leading-none tracking-tight normal-case">Design facts</p>
          <p className="mt-1">Serving size · 1 brand ({s.serving})</p>
        </div>
        <span className={`rounded-full px-2 py-1 ${s.chip}`}>#{s.no}</span>
      </div>
      <ul className="divide-y divide-ink/40 border-b-4 border-ink">
        {s.facts.map((f) => (
          <li key={f.k} className="flex items-center gap-3 py-1.5">
            <span className="w-32 shrink-0">{f.k}</span>
            <span className="relative h-2 flex-1 bg-ink/10">
              <span className={`absolute inset-y-0 left-0 ${f.w} ${s.dot}`} />
            </span>
            <span className="w-10 text-right font-bold">{f.v}%</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 normal-case leading-relaxed">
        <b className="uppercase">Ingredients:</b> {s.ingredients}
      </p>
      <p className="mt-2 normal-case text-ink/70">{s.note}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="flex flex-col">
          <Barcode seed={i + 3} className="h-10 w-32" />
          <span className="mt-1 tracking-[0.3em]">{s.ref.replace("-", " ")} {i + 1}84</span>
        </div>
        <p className="text-right">{s.storage}</p>
      </div>
      {/* self-checkout: fills while you scroll, then stamps */}
      <div className="mt-4 border-t-2 border-ink pt-3">
        <p className="flex justify-between">
          <span className="group-data-[state=idle]:inline hidden">Keep scrolling to scan ↓</span>
          <span className="group-data-[state=scan]:inline hidden animate-blink text-hot">● Scanning…</span>
          <span className="group-data-[state=bought]:inline hidden">Added to basket</span>
          <span>{s.ref}</span>
        </p>
        <div className="mt-2 h-3 border border-ink">
          <div data-scanbar className="h-full origin-left scale-x-0 bg-ink" />
        </div>
      </div>
      <span className="pointer-events-none absolute -right-3 top-24 rotate-12 scale-150 border-4 border-hot bg-shelf px-3 py-1 font-sans text-2xl font-black uppercase tracking-tight text-hot opacity-0 transition-all duration-300 ease-out group-data-[state=bought]:scale-100 group-data-[state=bought]:opacity-100">
        Purchased ✓
      </span>
    </div>
  )
}

function ProductSection({ s, i }: { s: Service; i: number }) {
  return (
    <section data-anchor={`p${i}`} data-product data-state="idle" className="group relative md:h-[300vh]">
      <div className="relative flex min-h-svh flex-col md:sticky md:top-0 md:h-svh md:min-h-0 md:flex-row md:items-center md:justify-between md:pl-8 md:pr-16 md:pt-16">
        {/* giant number behind the product */}
        <span className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 select-none text-center text-[38vw] font-black leading-none tracking-[-0.08em] text-shelf-dark md:block">
          {s.no}
        </span>
        {/* mobile: the product stays pinned in this stage while the copy scrolls underneath */}
        <div className="sticky top-0 z-[5] h-[54svh] shrink-0 overflow-hidden border-b border-ink bg-shelf md:hidden">
          <span className="pointer-events-none absolute inset-x-0 top-[9svh] select-none text-center text-[58vw] font-black leading-none tracking-[-0.08em] text-shelf-dark">
            {s.no}
          </span>
          <span className="absolute right-3 top-16 z-20 rotate-12 scale-150 border-4 border-hot bg-shelf px-2 py-0.5 text-lg font-black uppercase tracking-tight text-hot opacity-0 transition-all duration-300 ease-out group-data-[state=bought]:scale-100 group-data-[state=bought]:opacity-100">
            Purchased ✓
          </span>
          <div className="absolute inset-x-4 bottom-3 font-mono text-[10px] uppercase">
            <p className="flex justify-between">
              <span className="group-data-[state=idle]:inline hidden">Keep scrolling to scan ↓</span>
              <span className="group-data-[state=scan]:inline hidden animate-blink text-hot">● Scanning…</span>
              <span className="group-data-[state=bought]:inline hidden">Added to basket</span>
              <span>{s.ref}</span>
            </p>
            <div className="mt-1.5 h-2 border border-ink">
              <div data-scanbar className="h-full origin-left scale-x-0 bg-ink" />
            </div>
          </div>
        </div>

        <div className="relative flex flex-col gap-5 px-5 pb-10 pt-6 md:w-[30%] md:p-0">
          <div data-reveal className={`${reveal} flex items-center gap-3 font-mono text-[11px] uppercase`}>
            <span className={`size-3 rounded-full ${s.dot}`} />Aisle {s.no} / 04 · {s.kicker}
          </div>
          <h2 data-reveal className={`${reveal} text-[15vw] font-black uppercase leading-[0.82] tracking-[-0.05em] md:text-[5.6vw]`}>
            {s.title}
          </h2>
          <p data-reveal className={`${reveal} text-xl font-bold uppercase leading-none tracking-tight md:text-2xl`}>{s.tagline}</p>
          {s.body.map((b, k) => (
            <p key={k} data-reveal className={`${reveal} max-w-md text-sm leading-relaxed`}>
              {b}
            </p>
          ))}
        </div>

        <div className="relative flex justify-start px-5 pb-[34svh] md:w-[30%] md:justify-end md:p-0">
          <FactsLabel s={s} i={i} />
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------------ checkout / clients
function Checkout() {
  return (
    <section data-anchor="checkout" className="relative h-[340vh]">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div className="absolute inset-x-0 top-20 flex justify-between px-4 font-mono text-[11px] uppercase md:px-8">
          <span>( Checkout )</span>
          <span className="hidden md:inline">Stocked by brave clients — be unique, never boring</span>
        </div>
        <div className="flex flex-col gap-2 text-[16vw] font-black uppercase leading-[0.85] tracking-[-0.05em] text-shelf-dark md:text-[10vw]">
          <Marquee>
            {CLIENTS.slice(0, 7).map((c) => (
              <span key={c} className="pr-[4vw]">{c} ✦</span>
            ))}
          </Marquee>
          <Marquee anim="animate-marquee-rev">
            {CLIENTS.slice(7).map((c) => (
              <span key={c} className="pr-[4vw]">{c} ✦</span>
            ))}
          </Marquee>
        </div>
        <div className="absolute inset-x-0 bottom-8 mx-auto flex max-w-xl flex-col items-center gap-3 px-5 text-center">
          <p className="text-2xl font-black uppercase leading-none tracking-tight md:text-4xl">Four goods. One basket.</p>
          <p className="text-sm leading-relaxed">
            We work across sectors with very different people. The one thing they share: a stubborn wish to look nothing like their competitors.
          </p>
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------------ works
function Works() {
  return (
    <section id="works" className="relative z-20 bg-ink px-4 pb-24 pt-20 text-shelf md:px-8">
      <div className="mb-10 flex items-end justify-between gap-6">
        <h2 className="text-[13vw] font-black uppercase leading-[0.82] tracking-[-0.05em] md:text-[8vw]">
          Selected
          <br />
          projects!
        </h2>
        <span className="font-mono text-[11px] uppercase">( 2024 — 2026 )</span>
      </div>
      <ul className="border-t border-shelf/30">
        {WORKS.map((w, i) => (
          <li key={w.name}>
            <a
              href="#receipt"
              className="group flex items-center gap-4 border-b border-shelf/30 py-5 transition-colors hover:bg-shelf hover:text-ink md:gap-8 md:px-4 md:py-7"
            >
              <span className="w-8 font-mono text-[11px]">0{i + 1}</span>
              <span className={`size-3 shrink-0 scale-0 rounded-full transition-transform duration-300 group-hover:scale-100 ${w.dot}`} />
              <span className="flex-1 text-3xl font-bold uppercase tracking-tight transition-transform duration-500 group-hover:translate-x-3 md:text-6xl">
                {w.name}
              </span>
              <span className="hidden font-mono text-[11px] uppercase md:block">{w.type}</span>
              <span className="font-mono text-[11px]">{w.year}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ------------------------------------------------------------------ receipt footer
function Receipt() {
  const [date, setDate] = useState("--/--/--")
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    const d = new Date()
    setDate(`${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(2)}`)
  }, [])
  const copy = () => {
    navigator.clipboard?.writeText(EMAIL).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }
  return (
    <footer id="receipt" className="relative z-20 bg-shelf px-4 pb-6 pt-24 md:px-8">
      <div className="grid gap-12 md:grid-cols-2 md:items-start">
        <div className="flex flex-col gap-6">
          <h2 className="text-[16vw] font-black uppercase leading-[0.82] tracking-[-0.05em] md:text-[8vw]">
            Let's
            <br />
            talk!
          </h2>
          <p className="max-w-sm text-sm leading-relaxed">
            We love meeting people we can build strange, good things with. New business, collaborations or just a hello — the till is always open.
          </p>
          <button
            type="button"
            onClick={copy}
            className="w-fit rounded-full bg-ink px-6 py-4 text-left font-mono text-sm uppercase text-shelf transition-colors hover:bg-hot hover:text-ink"
          >
            {copied ? "E-mail copied ✓" : EMAIL}
          </button>
        </div>

        <div data-reveal className={`${reveal} mx-auto w-full max-w-sm`}>
          <div className="receipt-edge h-3 bg-white" />
          <div className="bg-white px-6 pb-6 pt-2 font-mono text-[12px] uppercase text-ink shadow-[0_30px_60px_-30px_rgba(0,0,0,0.4)]">
            <p className="text-center font-sans text-2xl font-black normal-case tracking-tight">PANTRY®</p>
            <p className="text-center">Design goods · Self-service</p>
            <p className="mt-3 flex justify-between">
              <span>{date}</span>
              <span>Till 04</span>
            </p>
            <p className="my-2 overflow-hidden whitespace-nowrap">--------------------------------------------</p>
            <p className="text-center">** Design goods **</p>
            <p className="my-2 overflow-hidden whitespace-nowrap">--------------------------------------------</p>
            {SERVICES.map((s) => (
              <div key={s.ref} className="mb-2">
                <p className="flex justify-between">
                  <span>{s.title}</span>
                  <span>x1</span>
                </p>
                <p className="text-ink/60">Ref: {s.ref}</p>
              </div>
            ))}
            <p className="my-2 overflow-hidden whitespace-nowrap">--------------------------------------------</p>
            <p className="flex justify-between text-sm font-bold">
              <span>Total:</span>
              <span>* Special project</span>
            </p>
            <p className="my-2 overflow-hidden whitespace-nowrap">********************************************</p>
            <p className="text-center">Thanks for your visit!</p>
            <p className="mt-1 text-center normal-case">{EMAIL}</p>
            <Barcode seed={42} className="mx-auto mt-4 h-12 w-48" />
          </div>
          <div className="receipt-edge h-3 rotate-180 bg-white" />
        </div>
      </div>

      <div className="mt-24 flex flex-wrap items-center justify-between gap-4 border-t border-ink pt-4 font-mono text-[11px] uppercase">
        <span>© 2026 PANTRY® design goods</span>
        <span className="flex items-center gap-2">
          <span className="size-2 animate-blink rounded-full bg-hot" /> This store is open 24h
        </span>
        <span className="flex gap-4">
          <a href="#receipt" className="hover:text-hot">Instagram</a>
          <a href="#receipt" className="hover:text-hot">Dribbble</a>
          <a href="#top" className="hover:text-hot">Back to top ↑</a>
        </span>
      </div>
    </footer>
  )
}

// ------------------------------------------------------------------ story chrome
const CHAPTERS = ["Enter", "01", "02", "03", "04", "Pay"]

function Rail({ chapter }: { chapter: number }) {
  return (
    <ol className="fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-3 font-mono text-[10px] uppercase md:flex">
      {CHAPTERS.map((c, i) => (
        <li key={c} data-on={i === chapter ? 1 : 0} className="group/rail flex items-center gap-2">
          <span className="opacity-0 transition-opacity duration-300 group-data-[on=1]/rail:opacity-100">{c}</span>
          <span className="h-px w-3 bg-ink transition-all duration-300 group-data-[on=1]/rail:h-0.5 group-data-[on=1]/rail:w-7 group-data-[on=1]/rail:bg-hot" />
        </li>
      ))}
    </ol>
  )
}

// the till receipt that prints one line per scanned product
function MiniReceipt({ count, show }: { count: number; show: boolean }) {
  return (
    <aside
      data-show={show ? 1 : 0}
      className="fixed bottom-0 left-6 z-30 hidden w-56 translate-y-full transition-transform duration-700 ease-out data-[show=1]:translate-y-0 md:block"
    >
      <div className="receipt-edge h-2.5 bg-white" />
      <div className="bg-white px-4 pb-3 pt-1 font-mono text-[10px] uppercase text-ink shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.35)]">
        <p className="flex justify-between font-bold">
          <span>PANTRY® till 04</span>
          <span>0{count}/04</span>
        </p>
        <p className="overflow-hidden whitespace-nowrap">------------------------------------</p>
        {SERVICES.map((s, i) => (
          <div key={s.ref} data-on={i < count ? 1 : 0} className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out data-[on=1]:grid-rows-[1fr]">
            <p className="flex justify-between overflow-hidden">
              <span className="py-0.5">{s.title}</span>
              <span className="py-0.5">x1</span>
            </p>
          </div>
        ))}
        <div data-on={count === 0 ? 1 : 0} className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 data-[on=1]:grid-rows-[1fr]">
          <p className="overflow-hidden text-ink/50">Basket empty — scan something</p>
        </div>
        <div data-on={count >= 4 ? 1 : 0} className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 data-[on=1]:grid-rows-[1fr]">
          <div className="overflow-hidden">
            <p className="overflow-hidden whitespace-nowrap">------------------------------------</p>
            <p className="flex justify-between font-bold">
              <span>Total</span>
              <span>* Special project</span>
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

// ------------------------------------------------------------------ page
export default function Site() {
  const [count, setCount] = useState(0)
  const [chapter, setChapter] = useState(0)
  const [showReceipt, setShowReceipt] = useState(false)
  const [sound, setSound] = useState(false)
  const audio = useRef<AudioContext | null>(null)
  const laser = useRef<HTMLDivElement>(null)

  const toggleSound = () => {
    if (!audio.current) {
      try {
        audio.current = new AudioContext()
      } catch {
        return
      }
    }
    audio.current.resume().catch(() => {})
    setSound((v) => !v)
  }

  // till beep whenever something new lands in the basket
  const prev = useRef(0)
  useEffect(() => {
    const ctx = audio.current
    if (sound && ctx && count > prev.current) {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = "square"
      o.frequency.value = 1900
      g.gain.setValueAtTime(0.06, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14)
      o.connect(g).connect(ctx.destination)
      o.start()
      o.stop(ctx.currentTime + 0.15)
    }
    prev.current = count
  }, [count, sound])

  // the story: every product section scans its product as you scroll through it
  useEffect(() => {
    const secs = Array.from(document.querySelectorAll<HTMLElement>("[data-product]"))
    const bars = secs.map((s) => Array.from(s.querySelectorAll<HTMLElement>("[data-scanbar]")))
    const statement = document.querySelector<HTMLElement>('[data-anchor="statement"]')
    const checkout = document.querySelector<HTMLElement>('[data-anchor="checkout"]')
    const works = document.getElementById("works")
    let raf = 0
    const run = () => {
      raf = requestAnimationFrame(run)
      const vh = window.innerHeight
      const mobile = window.innerWidth < 768
      let bought = 0
      let ch = 0
      let scanAt = -1
      secs.forEach((sec, i) => {
        const r = sec.getBoundingClientRect()
        const t = -r.top / Math.max(1, r.height - vh)
        const f = Math.min(1, Math.max(0, (t - SCAN_A) / (SCAN_B - SCAN_A)))
        const state = t >= SCAN_B ? "bought" : t > SCAN_A ? "scan" : "idle"
        if (sec.dataset.state !== state) sec.dataset.state = state
        bars[i].forEach((bar) => (bar.style.scale = `${f} 1`))
        if (state === "bought") bought++
        if (state === "scan") scanAt = f
        if (r.top < vh * 0.5) ch = i + 1
      })
      if (checkout && checkout.getBoundingClientRect().top < vh * 0.5) ch = 5
      const el = laser.current
      if (el) {
        el.style.opacity = scanAt >= 0 ? "1" : "0"
        if (scanAt >= 0) {
          const [a, b] = mobile ? [10, 46] : [20, 80]
          // sweep down and back up once
          const k = scanAt < 0.5 ? scanAt * 2 : 2 - scanAt * 2
          el.style.top = `${a + (b - a) * k}%`
        }
      }
      setCount(bought)
      setChapter(ch)
      setShowReceipt(
        !!statement && statement.getBoundingClientRect().bottom < vh && !!works && works.getBoundingClientRect().top > vh * 0.9,
      )
    }
    raf = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    // reveal-on-view
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && ((e.target as HTMLElement).dataset.in = "1")),
      { threshold: 0.15 },
    )
    document.querySelectorAll("[data-reveal]").forEach((n) => io.observe(n))

    // smooth scroll
    let lenis: { raf: (t: number) => void; destroy: () => void; scrollTo: (t: string | number) => void } | null = null
    let raf = 0
    let stop = false
    import("lenis")
      .then(({ default: Lenis }) => {
        if (stop) return
        lenis = new Lenis({ lerp: 0.1, anchors: true }) as unknown as typeof lenis
        const loop = (t: number) => {
          lenis?.raf(t)
          raf = requestAnimationFrame(loop)
        }
        raf = requestAnimationFrame(loop)
      })
      .catch(() => {})
    return () => {
      stop = true
      io.disconnect()
      cancelAnimationFrame(raf)
      lenis?.destroy()
    }
  }, [])

  return (
    <main className="relative min-h-screen overflow-x-clip bg-shelf font-sans text-ink antialiased">
      <Preloader />
      <Header count={count} sound={sound} onSound={toggleSound} />
      <Rail chapter={chapter} />
      <MiniReceipt count={count} show={showReceipt} />
      <div
        ref={laser}
        aria-hidden
        className="pointer-events-none fixed left-1/2 z-20 h-0.5 w-[64vw] -translate-x-1/2 bg-hot opacity-0 shadow-[0_0_24px_6px_rgba(255,75,31,0.55)] transition-opacity duration-200 md:w-[26vw]"
      />
      <Scene />
      <Hero />
      <Statement />
      {SERVICES.map((s, i) => (
        <ProductSection key={s.ref} s={s} i={i} />
      ))}
      <Checkout />
      <Works />
      <Receipt />
    </main>
  )
}
