// Procedural 3D "design goods": every model and every label is generated in code,
// no external assets. All builders take the THREE module so it can be lazy-loaded.

type T = typeof import("three")

export type ProductInfo = {
  ref: string
  name: string
  line: string
  color: string
  ink: string
  paper: string
}

export const PRODUCTS: ProductInfo[] = [
  { ref: "PNT-001", name: "BRAND\nIDENTITY", line: "Sparkling ideas", color: "#ff4b1f", ink: "#111111", paper: "#f3f1ec" },
  { ref: "PNT-002", name: "VISUAL\nSYSTEMS", line: "Whole fresh type", color: "#2f54ff", ink: "#0d0d0d", paper: "#f6f5f1" },
  { ref: "PNT-003", name: "INTERACTIVE\nWEB", line: "Squeeze the screen", color: "#d7ff3a", ink: "#0d0d0d", paper: "#111111" },
  { ref: "PNT-004", name: "BOLD\nCAMPAIGNS", line: "Daily dose of noise", color: "#ff7ad9", ink: "#0d0d0d", paper: "#ecebe7" },
]

const MONO = '"SF Mono", Menlo, Consolas, "Courier New", monospace'
const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif'

// --------------------------------------------------------------- canvas helpers
function canvas(w: number, h: number) {
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  return [c, c.getContext("2d")!] as const
}

function barcode(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, seed: number, color: string) {
  g.fillStyle = color
  let s = seed * 9301 + 49297
  let cx = x
  while (cx < x + w) {
    s = (s * 9301 + 49297) % 233280
    const bw = 2 + Math.floor((s / 233280) * 4) * 2
    s = (s * 9301 + 49297) % 233280
    const gap = 2 + Math.floor((s / 233280) * 3) * 2
    g.fillRect(cx, y, Math.min(bw, x + w - cx), h)
    cx += bw + gap
  }
}

function lines(g: CanvasRenderingContext2D, text: string, x: number, y: number, lh: number) {
  text.split("\n").forEach((t, i) => g.fillText(t, x, y + i * lh))
}

function tex(THREE: T, c: HTMLCanvasElement, renderer: import("three").WebGLRenderer) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
  return t
}

// wrap-around label (cans, bottles): 2048 x 1024, u goes around the object
function wrapLabel(p: ProductInfo, idx: number, kind: "can" | "bottle") {
  const [c, g] = canvas(2048, 1024)
  const W = 2048, H = 1024
  const dark = kind === "can"
  g.fillStyle = dark ? p.color : p.paper
  g.fillRect(0, 0, W, H)

  if (kind === "can") {
    // bold color field with a black band
    g.fillStyle = p.ink
    g.fillRect(0, H * 0.7, W, H * 0.3)
    g.fillStyle = p.paper
    g.font = `900 300px ${SANS}`
    g.textBaseline = "alphabetic"
    g.fillText("PANTRY", 60, 330)
    g.font = `700 64px ${SANS}`
    g.fillText("®", 1150, 140)
    g.fillStyle = p.ink
    g.font = `800 110px ${SANS}`
    lines(g, p.name, 60, 470, 104)
    g.font = `500 34px ${MONO}`
    g.fillText(`${p.line.toUpperCase()}  ·  330 ML  ·  ${p.ref}`, 64, 690)
    // back side: giant number
    g.font = `900 520px ${SANS}`
    g.fillStyle = p.ink
    g.fillText(`0${idx + 1}`, 1300, 640)
    g.fillStyle = p.color
    g.font = `500 34px ${MONO}`
    g.fillText("SERVE CHILLED · SHAKE YOUR BRAND", 64, H * 0.7 + 90)
    g.fillText("100% ORIGINAL CONCEPT · NO PRESERVATIVES", 64, H * 0.7 + 140)
    barcode(g, 1480, H * 0.7 + 40, 360, 160, idx + 3, p.color)
    // ring stripes
    g.fillStyle = p.paper
    for (let i = 0; i < 6; i++) g.fillRect(1180 + i * 16, 0, 6, H * 0.7)
  } else {
    // pharmacy-ish label
    g.fillStyle = p.ink
    g.fillRect(0, 0, W, 90)
    g.fillRect(0, H - 90, W, 90)
    g.fillStyle = p.color
    g.fillRect(0, 90, 620, H - 180)
    g.fillStyle = p.ink
    g.font = `900 260px ${SANS}`
    g.fillText(`0${idx + 1}`, 70, 560)
    g.font = `500 32px ${MONO}`
    g.fillText("60 CAPSULES", 80, 650)
    g.fillText("EXTRA STRENGTH", 80, 700)
    g.fillStyle = p.ink
    g.font = `900 150px ${SANS}`
    g.fillText("PANTRY®", 680, 280)
    g.font = `800 100px ${SANS}`
    lines(g, p.name, 680, 420, 96)
    g.font = `500 32px ${MONO}`
    g.fillText(`${p.line.toUpperCase()} · ${p.ref}`, 684, 650)
    g.fillText("TAKE ONE IDEA DAILY · DO NOT EXCEED", 684, 700)
    g.font = `500 28px ${MONO}`
    g.fillStyle = p.paper
    g.fillText("PANTRY® DESIGN GOODS — SUPPLEMENT FOR BRANDS", 40, 58)
    g.fillText("WARNING: MAY CAUSE ATTENTION", 40, H - 32)
    barcode(g, 1640, 560, 330, 170, idx + 7, p.ink)
    g.strokeStyle = p.ink
    g.lineWidth = 6
    g.strokeRect(1620, 160, 370, 340)
    g.font = `500 26px ${MONO}`
    g.fillStyle = p.ink
    lines(g, "DESIGN FACTS\nIDEAS ....... 92%\nTYPE ........ 88%\nMOTION ...... 81%\nNOISE ...... 100%\nBORING ....... 0%", 1640, 210, 46)
  }
  return c
}

// carton faces 1024 x 1024
function cartonFace(p: ProductInfo, idx: number, face: "front" | "side" | "back") {
  const [c, g] = canvas(1024, 1024)
  g.fillStyle = p.paper
  g.fillRect(0, 0, 1024, 1024)
  if (face === "front" || face === "back") {
    g.fillStyle = p.color
    g.fillRect(0, 560, 1024, 464)
    // cow-ish blobs → just big dots pattern, abstract
    g.fillStyle = p.ink
    g.font = `900 210px ${SANS}`
    g.fillText("PANTRY", 40, 220)
    g.font = `700 60px ${SANS}`
    g.fillText("®", 830, 110)
    g.font = `800 96px ${SANS}`
    lines(g, p.name, 44, 350, 92)
    g.fillStyle = p.paper
    g.font = `900 360px ${SANS}`
    g.fillText(`0${idx + 1}`, 30, 920)
    g.font = `500 30px ${MONO}`
    g.fillText(face === "front" ? "WHOLE · 1 L · PASTEURISED TYPE" : "BEST BEFORE: NEVER", 46, 990)
    if (face === "back") {
      g.fillStyle = p.paper
      g.fillRect(560, 620, 400, 300)
      barcode(g, 590, 650, 340, 200, idx + 11, p.ink)
    }
  } else {
    g.fillStyle = p.ink
    g.font = `800 64px ${SANS}`
    g.fillText("DESIGN", 50, 120)
    g.fillText("FACTS", 50, 186)
    g.fillRect(50, 214, 924, 10)
    g.font = `500 34px ${MONO}`
    const rows = ["GRID ........... 94%", "TYPOGRAPHY ..... 90%", "COLOUR ......... 86%", "ICONS .......... 72%", "CONSISTENCY ... 100%", "BORING .......... 0%"]
    rows.forEach((r, i) => g.fillText(r, 50, 290 + i * 62))
    g.fillRect(50, 680, 924, 4)
    g.font = `500 28px ${MONO}`
    lines(g, "KEEP REFRIGERATED.\nOPEN HERE → SHAKE WELL.\nINGREDIENTS: GRIDS, TYPE,\nCOLOUR, RULES, SURPRISE.", 50, 740, 44)
    g.fillStyle = p.color
    g.beginPath()
    g.arc(860, 860, 90, 0, Math.PI * 2)
    g.fill()
  }
  return c
}

// tube label 2048 x 1024: u around, v along tube
function tubeLabel(p: ProductInfo, idx: number) {
  const [c, g] = canvas(2048, 1024)
  g.fillStyle = p.paper
  g.fillRect(0, 0, 2048, 1024)
  g.fillStyle = p.color
  g.fillRect(0, 0, 2048, 260)
  g.fillStyle = "#111"
  g.font = `900 180px ${SANS}`
  g.fillText("PANTRY®", 60, 200)
  g.fillText("PANTRY®", 1080, 200)
  g.fillStyle = p.color
  g.font = `800 120px ${SANS}`
  lines(g, p.name, 60, 420, 116)
  g.font = `900 440px ${SANS}`
  g.fillText(`0${idx + 1}`, 1100, 740)
  g.fillStyle = "#f2f2ee"
  g.font = `500 36px ${MONO}`
  g.fillText(`${p.line.toUpperCase()} · 200 ML · ${p.ref}`, 64, 700)
  g.fillText("ACRYLIC PIXELS · HIGH PIGMENT", 64, 760)
  g.fillText("SQUEEZE FROM THE BOTTOM", 64, 820)
  // colour swatches
  ;["#ff4b1f", "#2f54ff", "#d7ff3a", "#ff7ad9", "#f2f2ee"].forEach((col, i) => {
    g.fillStyle = col
    g.fillRect(64 + i * 92, 870, 72, 72)
  })
  barcode(g, 1100, 820, 300, 120, idx + 5, "#f2f2ee")
  return c
}

// ------------------------------------------------------------------ materials
function plastic(THREE: T, color: string, rough = 0.42) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.25 })
}
function metal(THREE: T, color = "#cfd2d6", rough = 0.28) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 1 })
}

// ------------------------------------------------------------------ models
// every model is centred at the origin and roughly 2.4 units tall

function buildCan(THREE: T, p: ProductInfo, idx: number, r: import("three").WebGLRenderer) {
  const group = new THREE.Group()
  const R = 0.66
  const H = 1.9
  const labelTex = tex(THREE, wrapLabel(p, idx, "can"), r)
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R, H, 96, 1, true),
    new THREE.MeshPhysicalMaterial({ map: labelTex, roughness: 0.32, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.12 }),
  )
  group.add(body)

  // top: shoulder → rim → recessed lid (lathe)
  const top = [
    [R, 0], [R - 0.02, 0.06], [R * 0.86, 0.2], [R * 0.84, 0.235], [R * 0.86, 0.255], [R * 0.84, 0.27],
    [R * 0.8, 0.255], [R * 0.79, 0.2], [0, 0.2],
  ].map(([x, y]) => new THREE.Vector2(x, y))
  const topMesh = new THREE.Mesh(new THREE.LatheGeometry(top, 96), metal(THREE))
  topMesh.position.y = H / 2
  group.add(topMesh)

  const bottom = [
    [0, -0.05], [R * 0.6, -0.04], [R * 0.72, -0.12], [R * 0.86, -0.13], [R * 0.98, -0.06], [R, 0],
  ].map(([x, y]) => new THREE.Vector2(x, y))
  const botMesh = new THREE.Mesh(new THREE.LatheGeometry(bottom, 96), metal(THREE, "#b9bcc0"))
  botMesh.position.y = -H / 2
  group.add(botMesh)

  // pull tab
  const tabShape = new THREE.Shape()
  tabShape.absarc(0, 0, 0.16, Math.PI * 0.15, Math.PI * 1.85, false)
  tabShape.lineTo(0.3, -0.07)
  tabShape.absarc(0.3, 0, 0.07, -Math.PI / 2, Math.PI / 2, false)
  tabShape.lineTo(0.15, 0.06)
  const hole = new THREE.Path()
  hole.absarc(-0.02, 0, 0.08, 0, Math.PI * 2, true)
  tabShape.holes.push(hole)
  const tab = new THREE.Mesh(
    new THREE.ExtrudeGeometry(tabShape, { depth: 0.015, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.006, bevelSegments: 2 }),
    metal(THREE, "#d9dbde", 0.2),
  )
  tab.rotation.x = -Math.PI / 2
  tab.position.set(-0.12, H / 2 + 0.215, 0)
  group.add(tab)
  const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 20), metal(THREE))
  rivet.position.set(0.18, H / 2 + 0.21, 0)
  group.add(rivet)
  group.position.y = -0.04
  const wrap = new THREE.Group()
  wrap.add(group)
  wrap.scale.setScalar(1.12)
  return wrap
}

function buildCarton(THREE: T, p: ProductInfo, idx: number, r: import("three").WebGLRenderer) {
  const group = new THREE.Group()
  const W = 1.05, D = 1.05, H = 1.75
  const front = tex(THREE, cartonFace(p, idx, "front"), r)
  const back = tex(THREE, cartonFace(p, idx, "back"), r)
  const side = tex(THREE, cartonFace(p, idx, "side"), r)
  const mk = (map: import("three").Texture) => new THREE.MeshPhysicalMaterial({ map, roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.4 })
  const paper = plastic(THREE, p.paper, 0.55)
  // BoxGeometry material order: +x, -x, +y, -y, +z, -z
  const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), [mk(side), mk(side), paper, paper, mk(front), mk(back)])
  group.add(body)

  // gable roof: triangular prism along z, slopes face ±x
  const roofH = 0.48
  const sh = new THREE.Shape()
  sh.moveTo(-W / 2, 0)
  sh.lineTo(W / 2, 0)
  sh.lineTo(0.02, roofH)
  sh.lineTo(-0.02, roofH)
  sh.closePath()
  const roofGeo = new THREE.ExtrudeGeometry(sh, { depth: D, bevelEnabled: false })
  roofGeo.translate(0, 0, -D / 2)
  const roof = new THREE.Mesh(roofGeo, [plastic(THREE, p.paper, 0.5), plastic(THREE, p.color, 0.5)])
  roof.position.y = H / 2
  group.add(roof)
  // top fin
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, D), plastic(THREE, p.paper, 0.5))
  fin.position.y = H / 2 + roofH + 0.06
  group.add(fin)
  // screw cap on the slope
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.12, 40), plastic(THREE, p.color, 0.35))
  const slope = Math.atan2(roofH, W / 2)
  cap.rotation.z = slope
  cap.position.set(-W * 0.25 - 0.02, H / 2 + roofH * 0.5 + 0.05, 0.12)
  group.add(cap)
  group.position.y = -0.3
  const wrap = new THREE.Group()
  wrap.add(group)
  wrap.scale.setScalar(1.05)
  return wrap
}

function buildTube(THREE: T, p: ProductInfo, idx: number, r: import("three").WebGLRenderer) {
  const group = new THREE.Group()
  // parametric tube: circle at the shoulder morphs to a flat crimp at the end
  const SEG_U = 96, SEG_V = 60
  const L = 2.0, R = 0.5
  const pos: number[] = [], uv: number[] = [], index: number[] = []
  for (let j = 0; j <= SEG_V; j++) {
    const v = j / SEG_V
    const y = -L / 2 + v * L
    const flat = Math.pow(1 - v, 2.4) // 1 at crimp end (bottom), 0 at shoulder
    const widen = 1 + flat * 0.32
    const squash = Math.max(0.035, 1 - flat * 1.02)
    for (let i = 0; i <= SEG_U; i++) {
      const u = i / SEG_U
      const a = u * Math.PI * 2
      pos.push(Math.sin(a) * R * widen, y, Math.cos(a) * R * squash)
      uv.push(u, v)
    }
  }
  for (let j = 0; j < SEG_V; j++)
    for (let i = 0; i < SEG_U; i++) {
      const a = j * (SEG_U + 1) + i, b = a + SEG_U + 1
      index.push(a, b, a + 1, b, b + 1, a + 1)
    }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2))
  geo.setIndex(index)
  geo.computeVertexNormals()
  const labelTex = tex(THREE, tubeLabel(p, idx), r)
  const tube = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ map: labelTex, roughness: 0.3, metalness: 0.55, clearcoat: 1, clearcoatRoughness: 0.15, side: THREE.DoubleSide }))
  group.add(tube)

  // crimp with ridges
  const crimp = new THREE.Mesh(new THREE.BoxGeometry(R * 2 * 1.32 + 0.02, 0.16, 0.05), metal(THREE, "#202020", 0.4))
  crimp.position.y = -L / 2 - 0.06
  group.add(crimp)
  for (let k = 0; k < 7; k++) {
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(R * 2 * 1.32 + 0.03, 0.012, 0.06), metal(THREE, "#3a3a3a", 0.3))
    ridge.position.y = -L / 2 - 0.12 + k * 0.02
    group.add(ridge)
  }
  // shoulder + neck + cap
  const shoulderPts = [[R, 0], [R * 0.92, 0.1], [R * 0.6, 0.2], [0.2, 0.24], [0.2, 0.3]].map(([x, y]) => new THREE.Vector2(x, y))
  const shoulder = new THREE.Mesh(new THREE.LatheGeometry(shoulderPts, 64), metal(THREE, "#d8d8d8", 0.25))
  shoulder.position.y = L / 2
  group.add(shoulder)
  const capPts: import("three").Vector2[] = []
  // ribbed cap profile
  for (let k = 0; k <= 20; k++) {
    const y = k * 0.022
    capPts.push(new THREE.Vector2(0.27 + (k % 2 ? 0.0 : 0.012), y))
  }
  capPts.unshift(new THREE.Vector2(0, 0))
  capPts.push(new THREE.Vector2(0.24, 0.46), new THREE.Vector2(0, 0.46))
  const cap = new THREE.Mesh(new THREE.LatheGeometry(capPts, 64), plastic(THREE, "#111111", 0.35))
  cap.position.y = L / 2 + 0.26
  group.add(cap)
  group.position.y = -0.2
  const wrap = new THREE.Group()
  wrap.add(group)
  wrap.scale.setScalar(1.0)
  return wrap
}

function buildBottle(THREE: T, p: ProductInfo, idx: number, r: import("three").WebGLRenderer) {
  const group = new THREE.Group()
  const R = 0.62
  // bottle shell (lathe)
  const shell = [
    [0, -0.95], [R * 0.9, -0.95], [R, -0.88], [R, 0.62], [R * 0.95, 0.74], [R * 0.7, 0.86], [0.42, 0.9], [0.42, 1.02], [0, 1.02],
  ].map(([x, y]) => new THREE.Vector2(x, y))
  const body = new THREE.Mesh(new THREE.LatheGeometry(shell, 96), plastic(THREE, "#f4f3ef", 0.3))
  group.add(body)
  // label wrap slightly larger
  const labelTex = tex(THREE, wrapLabel(p, idx, "bottle"), r)
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(R + 0.006, R + 0.006, 1.22, 96, 1, true),
    new THREE.MeshPhysicalMaterial({ map: labelTex, roughness: 0.55, clearcoat: 0.4 }),
  )
  label.position.y = -0.14
  group.add(label)
  // ribbed child-proof cap
  const capPts: import("three").Vector2[] = [new THREE.Vector2(0, 0)]
  for (let k = 0; k <= 30; k++) capPts.push(new THREE.Vector2(0.5 + (k % 2 ? 0 : 0.014), k * 0.017))
  capPts.push(new THREE.Vector2(0.48, 0.53), new THREE.Vector2(0, 0.54))
  const capGeo = new THREE.LatheGeometry(capPts, 120)
  const cap = new THREE.Mesh(capGeo, plastic(THREE, p.color, 0.38))
  cap.position.y = 0.94
  group.add(cap)
  // vertical knurls on the cap
  const knurl = new THREE.InstancedMesh(new THREE.BoxGeometry(0.02, 0.44, 0.03), plastic(THREE, p.color, 0.38), 48)
  const m = new THREE.Matrix4()
  for (let k = 0; k < 48; k++) {
    const a = (k / 48) * Math.PI * 2
    m.makeRotationY(a)
    m.setPosition(Math.sin(a) * 0.512, 0.94 + 0.26, Math.cos(a) * 0.512)
    knurl.setMatrixAt(k, m)
  }
  group.add(knurl)
  group.position.y = -0.2
  const wrap = new THREE.Group()
  wrap.add(group)
  wrap.scale.setScalar(1.08)
  return wrap
}

// plastic shopping basket: slatted sides, thick rim, two folded handles
function buildBasket(THREE: T) {
  const group = new THREE.Group()
  const W = 3.5, D = 2.1, H = 1.3, TAPER = 0.86
  const mat = plastic(THREE, "#ff4b1f", 0.38)
  const dark = plastic(THREE, "#161616", 0.4)
  const up = new THREE.Vector3(0, 1, 0)
  const bar = (a: [number, number, number], b: [number, number, number], r: number, m = mat) => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b)
    const dir = vb.clone().sub(va)
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, dir.length(), 10), m)
    mesh.position.copy(va).add(vb).multiplyScalar(0.5)
    mesh.quaternion.setFromUnitVectors(up, dir.normalize())
    group.add(mesh)
  }
  const ring = (y: number, k: number, r: number) => {
    const w = (W / 2) * k, d = (D / 2) * k
    bar([-w, y, d], [w, y, d], r)
    bar([-w, y, -d], [w, y, -d], r)
    bar([-w, y, -d], [-w, y, d], r)
    bar([w, y, -d], [w, y, d], r)
    ;[[-w, d], [w, d], [-w, -d], [w, -d]].forEach(([x, z]) => {
      const c = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat)
      c.position.set(x, y, z)
      group.add(c)
    })
  }
  const top = H / 2, bot = -H / 2
  ring(top, 1, 0.07)
  ring(top - H * 0.36, 1 - (1 - TAPER) * 0.36, 0.028)
  ring(top - H * 0.68, 1 - (1 - TAPER) * 0.68, 0.028)
  ring(bot, TAPER, 0.045)
  // vertical slats
  const NX = 12, NZ = 7
  for (let i = 0; i <= NX; i++) {
    const x = -W / 2 + (W * i) / NX
    for (const z of [D / 2, -D / 2]) bar([x * TAPER, bot, z * TAPER], [x, top, z], 0.028)
  }
  for (let i = 1; i < NZ; i++) {
    const z = -D / 2 + (D * i) / NZ
    for (const x of [W / 2, -W / 2]) bar([x * TAPER, bot, z * TAPER], [x, top, z], 0.028)
  }
  // floor grid
  for (let i = 1; i < NX; i += 1) {
    const x = (-W / 2 + (W * i) / NX) * TAPER
    bar([x, bot, (-D / 2) * TAPER], [x, bot, (D / 2) * TAPER], 0.022)
  }
  // handles: folded down along the long sides
  for (const side of [1, -1]) {
    const pts: [number, number, number][] = []
    for (let k = 0; k <= 16; k++) {
      const a = (k / 16) * Math.PI
      pts.push([-Math.cos(a) * W * 0.3, top - 0.1 - Math.sin(a) * 0.62, side * (D / 2 + 0.09 + Math.sin(a) * 0.05)])
    }
    for (let k = 0; k < 16; k++) bar(pts[k], pts[k + 1], 0.045, dark)
  }
  return group
}

export function buildProducts(THREE: T, renderer: import("three").WebGLRenderer) {
  return [
    buildCan(THREE, PRODUCTS[0], 0, renderer),
    buildCarton(THREE, PRODUCTS[1], 1, renderer),
    buildTube(THREE, PRODUCTS[2], 2, renderer),
    buildBottle(THREE, PRODUCTS[3], 3, renderer),
    buildBasket(THREE),
  ]
}

// soft studio environment generated from a few emissive panels
export function studioEnv(THREE: T, renderer: import("three").WebGLRenderer) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color("#8d8c8a")
  const box = new THREE.BoxGeometry(1, 1, 1)
  const panel = (color: string, intensity: number, pos: [number, number, number], scale: [number, number, number]) => {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity) })
    const mesh = new THREE.Mesh(box, mat)
    mesh.position.set(...pos)
    mesh.scale.set(...scale)
    mesh.lookAt(0, 0, 0)
    scene.add(mesh)
  }
  // room
  const room = new THREE.Mesh(new THREE.BoxGeometry(30, 20, 30), new THREE.MeshBasicMaterial({ color: "#6f6e6c", side: THREE.BackSide }))
  scene.add(room)
  panel("#ffffff", 7, [0, 9, 2], [14, 0.2, 6])
  panel("#ffffff", 4, [-12, 3, 4], [0.2, 6, 10])
  panel("#fff3e6", 3, [12, 2, -2], [0.2, 5, 6])
  panel("#ffffff", 2.5, [0, 2, 12], [10, 4, 0.2])
  panel("#dfe6ff", 1.5, [0, -6, -10], [16, 4, 0.2])
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromScene(scene, 0.035).texture
  pmrem.dispose()
  return env
}
