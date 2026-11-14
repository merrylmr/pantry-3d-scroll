import { useEffect, useRef } from "react"
import { SCAN_A, SCAN_B } from "./story"

// Fixed WebGL layer. Five objects (4 products + the basket) move between "poses"
// pinned to scroll positions. The story:
//   hero → statement → for each product: present → scan → fly into the basket chip
//   → checkout: the basket rolls in and the four products drop into it.

type V3 = [number, number, number]
// abs: authored in final world units (skip the responsive fit). m: mouse-tilt amount.
type Pose = { p: V3; r: V3; s: number; abs?: boolean; m?: number }
type Anchor = { y: number; poses: Pose[] }

const TAU = Math.PI * 2
const OFF = 8.5 // far outside the view
const VIEW = 3.15 // half view height in world units at z = 0

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

const basketHidden = (S: number): Pose => ({ p: [0, -OFF, 0], r: [0.32, 0, 0], s: S, abs: true, m: 0.12 })

function heroPoses(mobile: boolean): Pose[] {
  if (mobile)
    return [
      { p: [-0.72, 1.05, 0.4], r: [0.2, -0.5, 0.22], s: 0.6 },
      { p: [0.78, 1.4, -0.3], r: [0.1, 0.6, -0.12], s: 0.55 },
      { p: [-0.62, -1.1, 0.6], r: [0.15, -0.2, -0.55], s: 0.6 },
      { p: [0.78, -0.85, 0], r: [-0.1, 0.4, 0.18], s: 0.55 },
    ]
  return [
    { p: [-3.3, -0.2, 0.4], r: [0.2, -0.5, 0.22], s: 1 },
    { p: [-1.05, 0.55, -0.3], r: [0.1, 0.6, -0.12], s: 0.95 },
    { p: [1.15, -0.45, 0.6], r: [0.15, -0.2, -0.55], s: 1 },
    { p: [3.3, 0.35, 0], r: [-0.1, 0.4, 0.18], s: 0.95 },
  ]
}
function statementPoses(mobile: boolean): Pose[] {
  if (mobile)
    return [
      { p: [-1.1, 2.55, -1], r: [0.5, 1.4, 0.4], s: 0.36 },
      { p: [1.1, 2.5, -1], r: [-0.3, 2.2, -0.3], s: 0.34 },
      { p: [-1.1, -2.55, -1], r: [0.3, 2.6, -1.1], s: 0.36 },
      { p: [1.1, -2.5, -1], r: [0.4, 3.4, 0.5], s: 0.34 },
    ]
  return [
    { p: [-4.9, 2.1, -1], r: [0.5, 1.4, 0.4], s: 0.62 },
    { p: [4.9, 2.0, -1], r: [-0.3, 2.2, -0.3], s: 0.6 },
    { p: [-4.7, -2.1, -1], r: [0.3, 2.6, -1.1], s: 0.62 },
    { p: [4.8, -2.2, -1], r: [0.4, 3.4, 0.5], s: 0.6 },
  ]
}

// one product on stage. phase: in → shown (full turn) → scanned (faces the scanner) → bought (in the basket chip)
function focusPoses(k: number, phase: "in" | "shown" | "scanned" | "bought", mobile: boolean, chip: V3): Pose[] {
  const center: V3 = [0, mobile ? 1.2 : -0.05, 0.6]
  const s = mobile ? 0.8 : 1.28
  const bought: Pose = { p: chip, r: [0.6, TAU + 2.6, 0.9], s: 0, abs: true }
  return [0, 1, 2, 3].map((i): Pose => {
    if (i < k) return bought
    if (i > k) return { p: [mobile ? 0.6 : 1.5, -OFF, -1], r: [-1.2, -2, 0.6], s: 0.9 }
    if (phase === "in") return { p: center, r: [0.12, -0.7, 0.08], s }
    if (phase === "shown") return { p: center, r: [0.05, -0.7 + TAU, -0.08], s }
    if (phase === "scanned") return { p: center, r: [0, -0.3 + TAU, 0], s: s * 1.04 }
    return bought
  })
}

// checkout: basket in the middle, `landed` products already inside, the rest waiting above
const SLOT_X = [-1.2, -0.42, 0.42, 1.2]
const SLOT_Z = [0.22, -0.3, 0.3, -0.22]
const SLOT_R: V3[] = [[0, 0.5, 0.16], [0, -0.4, -0.1], [0, 0.3, 0.22], [0, 0.9, -0.14]]
function checkoutPoses(landed: number, S: number, cy: number, o: { lift?: number; basket?: boolean } = {}): Pose[] {
  const lift = o.lift ?? 0
  const tilt = 0.32
  const cos = Math.cos(tilt), sin = Math.sin(tilt)
  const items = [0, 1, 2, 3].map((i): Pose => {
    if (i >= landed) return { p: [SLOT_X[i] * S, 5.4 + i * 0.4 + lift, 0], r: [1.1, 2 + i, 0.6], s: 0.6 * S, abs: true, m: 0.12 }
    const x = SLOT_X[i] * S, y = 0.42 * S, z = SLOT_Z[i] * S
    return {
      p: [x, cy + lift + y * cos - z * sin, y * sin + z * cos],
      r: [tilt + SLOT_R[i][0], SLOT_R[i][1], SLOT_R[i][2]],
      s: 0.6 * S,
      abs: true,
      m: 0.12,
    }
  })
  const basket: Pose = o.basket === false ? basketHidden(S) : { p: [0, cy + lift, 0], r: [tilt, 0, 0], s: S, abs: true, m: 0.12 }
  return [...items, basket]
}

export default function Scene() {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let disposed = false
    let cleanup = () => {}

    ;(async () => {
      const THREE = await import("three")
      const { buildProducts, studioEnv } = await import("./products")
      if (disposed || !host.current) return
      const el = host.current

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.05
      renderer.outputColorSpace = THREE.SRGBColorSpace
      el.appendChild(renderer.domElement)
      renderer.domElement.className = "block h-full w-full"

      const scene = new THREE.Scene()
      scene.environment = studioEnv(THREE, renderer)
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
      camera.position.set(0, 0, 10)

      const key = new THREE.DirectionalLight("#ffffff", 1.4)
      key.position.set(4, 6, 6)
      scene.add(key)
      const rim = new THREE.DirectionalLight("#ffffff", 1.2)
      rim.position.set(-6, 2, -4)
      scene.add(rim)
      // the scanner: a red light that only fires while a product is being scanned
      const scanLight = new THREE.DirectionalLight("#ff2a1a", 0)
      scanLight.position.set(0, -1, 6)
      scene.add(scanLight)

      try { await document.fonts?.ready } catch { /* ignore */ }
      if (disposed) { renderer.dispose(); return }

      const objects = buildProducts(THREE, renderer)
      const pivots = objects.map((m) => {
        const pivot = new THREE.Group()
        const spin = new THREE.Group() // idle wobble lives here
        spin.add(m)
        pivot.add(spin)
        scene.add(pivot)
        return { pivot, spin }
      })

      // ---------------------------------------------------- anchors
      let anchors: Anchor[] = []
      let secs: { top: number; len: number }[] = []
      const docY = (n: Element) => n.getBoundingClientRect().top + window.scrollY
      const measure = () => {
        const vh = window.innerHeight
        const w = window.innerWidth
        const mobile = w < 768
        renderer.setSize(w, vh, false)
        camera.aspect = w / vh
        camera.updateProjectionMatrix()
        const aspect = camera.aspect

        // desktop poses are authored for ~16:9, squeeze them for narrower windows
        const kx = mobile ? 1 : clamp(aspect / 1.75, 0.5, 1)
        const ks = mobile ? 1 : clamp(aspect / 1.4, 0.7, 1)
        const S = mobile ? 0.4 : clamp(aspect / 1.75, 0.6, 1) // basket scale
        const cy = mobile ? 0.1 : -0.55
        const chip: V3 = [VIEW * aspect - (mobile ? 0.5 : 0.8), VIEW - 0.32, 0] // where the header basket button sits
        const fit = (poses: Pose[]): Pose[] => [
          ...poses.map((p): Pose => (p.abs ? p : { ...p, p: [p.p[0] * kx, p.p[1], p.p[2]], s: p.s * ks })),
          basketHidden(S),
        ]

        const q = (k: string) => document.querySelector(`[data-anchor="${k}"]`) as HTMLElement | null
        const list: Anchor[] = [{ y: 0, poses: fit(heroPoses(mobile)) }]
        const st = q("statement")
        if (st) list.push({ y: docY(st) + st.offsetHeight / 2 - vh / 2, poses: fit(statementPoses(mobile)) })
        secs = []
        let lastEnd = 0
        for (let k = 0; k < 4; k++) {
          const s = q(`p${k}`)
          if (!s) continue
          const top = docY(s)
          const len = Math.max(1, s.offsetHeight - vh)
          secs.push({ top, len })
          list.push({ y: top, poses: fit(focusPoses(k, "in", mobile, chip)) })
          list.push({ y: top + len * SCAN_A, poses: fit(focusPoses(k, "shown", mobile, chip)) })
          list.push({ y: top + len * SCAN_B, poses: fit(focusPoses(k, "scanned", mobile, chip)) })
          list.push({ y: top + len, poses: fit(focusPoses(k, "bought", mobile, chip)) })
          lastEnd = top + len
        }
        const co = q("checkout")
        if (co) {
          const top = docY(co)
          const len = Math.max(1, co.offsetHeight - vh)
          // everything is invisible here (scale 0 → off-screen), so this jump is never seen
          list.push({ y: lastEnd + 2, poses: checkoutPoses(0, S, cy, { basket: false }) })
          list.push({ y: top, poses: checkoutPoses(0, S, cy) })
          for (let j = 1; j <= 4; j++) list.push({ y: top + len * (0.08 + j * 0.19), poses: checkoutPoses(j, S, cy) })
          list.push({ y: top + len, poses: checkoutPoses(4, S, cy) })
          list.push({ y: top + len + vh, poses: checkoutPoses(4, S, cy, { lift: VIEW * 2 + 1.2 }) })
        }
        list.sort((a, b) => a.y - b.y)
        anchors = list
      }
      measure()
      const ro = new ResizeObserver(measure)
      ro.observe(document.body)
      window.addEventListener("resize", measure)

      const out: Pose[] = [0, 1, 2, 3, 4].map(() => ({ p: [0, 0, 0], r: [0, 0, 0], s: 1, m: 1 }))
      const sample = (y: number) => {
        let a = anchors[0], b = anchors[0], t = 0
        if (y >= anchors[anchors.length - 1].y) a = b = anchors[anchors.length - 1]
        else if (y > anchors[0].y)
          for (let i = 0; i < anchors.length - 1; i++)
            if (y <= anchors[i + 1].y) {
              a = anchors[i]
              b = anchors[i + 1]
              t = ease(clamp((y - a.y) / Math.max(1, b.y - a.y), 0, 1))
              break
            }
        for (let k = 0; k < out.length; k++) {
          const pa = a.poses[k], pb = b.poses[k], o = out[k]
          for (let j = 0; j < 3; j++) {
            o.p[j] = lerp(pa.p[j], pb.p[j], t)
            o.r[j] = lerp(pa.r[j], pb.r[j], t)
          }
          o.s = lerp(pa.s, pb.s, t)
          o.m = lerp(pa.m ?? 1, pb.m ?? 1, t)
        }
        return out
      }

      // ---------------------------------------------------- pointer
      const mouse = { x: 0, y: 0, sx: 0, sy: 0 }
      const onMove = (e: PointerEvent) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1
        mouse.y = (e.clientY / window.innerHeight) * 2 - 1
      }
      window.addEventListener("pointermove", onMove)

      // ---------------------------------------------------- loop
      let smoothY = window.scrollY
      let raf = 0
      let last = performance.now()
      const clock0 = last
      const tick = (now: number) => {
        raf = requestAnimationFrame(tick)
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now
        const time = (now - clock0) / 1000
        smoothY = lerp(smoothY, window.scrollY, 1 - Math.pow(0.0008, dt))
        mouse.sx = lerp(mouse.sx, mouse.x, 1 - Math.pow(0.02, dt))
        mouse.sy = lerp(mouse.sy, mouse.y, 1 - Math.pow(0.02, dt))

        const poses = sample(smoothY)
        poses.forEach((ps, i) => {
          const { pivot, spin } = pivots[i]
          const m = ps.m ?? 1
          pivot.position.set(ps.p[0], ps.p[1], ps.p[2])
          pivot.rotation.set(ps.r[0] + mouse.sy * 0.25 * m, ps.r[1] + mouse.sx * 0.45 * m, ps.r[2])
          pivot.scale.setScalar(Math.max(ps.s, 0.0001))
          spin.position.y = Math.sin(time * 0.9 + i * 1.7) * 0.08 * m
          spin.rotation.z = Math.sin(time * 0.6 + i) * 0.04 * m
          spin.rotation.y = Math.sin(time * 0.4 + i * 2.1) * 0.12 * m
          pivot.visible = ps.s > 0.012 && Math.abs(ps.p[1]) < OFF - 1.5
        })

        // scanner flash
        let scanning = 0
        for (const s of secs) {
          const t = (smoothY - s.top) / s.len
          if (t > SCAN_A && t < SCAN_B) scanning = 0.6 + 0.4 * Math.sin(time * 18)
          else if (t >= SCAN_B && t < SCAN_B + 0.03) scanning = 2.2
        }
        scanLight.intensity = lerp(scanLight.intensity, scanning * 3.2, 0.25)

        renderer.render(scene, camera)
      }
      raf = requestAnimationFrame(tick)
      el.dataset.ready = "1"

      cleanup = () => {
        cancelAnimationFrame(raf)
        ro.disconnect()
        window.removeEventListener("resize", measure)
        window.removeEventListener("pointermove", onMove)
        scene.traverse((o) => {
          const m = o as import("three").Mesh
          m.geometry?.dispose()
          const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : []
          mats.forEach((mt) => {
            ;(mt as import("three").MeshStandardMaterial).map?.dispose()
            mt.dispose()
          })
        })
        renderer.dispose()
        renderer.domElement.remove()
      }
    })()

    return () => {
      disposed = true
      cleanup()
    }
  }, [])

  return (
    <div
      ref={host}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-10 opacity-0 transition-opacity duration-1000 data-[ready=1]:opacity-100"
    />
  )
}
