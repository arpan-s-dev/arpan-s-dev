// Generates a static (non-animated) SVG of the portfolio "AI ecosystem"
// tech-stack graph for the GitHub profile README. Ported from
// my_portfolio/components/home/tech-stack.tsx + tech-logos.tsx.
import { writeFileSync } from "node:fs"

// Palette matched to the profile README (Dracula / GitHub-dark).
const BG = "#0d1117"        // GitHub dark base
const PANEL = "#1a1b27"     // elevated node fill (README labelColor)
const GOLD = "#bd93f9"      // accent (README purple) — name kept for brevity
const TEXT = "#f8f8f2"      // Dracula foreground
const MUTED = "#6272a4"     // Dracula comment

const groups = [
  { code: "AGT", tools: [
    ["Python","python","#3776AB"],["PyTorch","pytorch","#EE4C2C"],["HuggingFace","huggingface","#F59E0B"],
    ["Claude API","claude","#D97706"],["LangGraph","langgraph","#10B981"],["DuckDB","duckdb","#F97316"] ] },
  { code: "OCR", tools: [
    ["Tesseract","tesseract","#A3E635"],["pdfplumber","pdfplumber","#F43F5E"],["openpyxl","openpyxl","#22C55E"],
    ["Parquet","parquet","#06B6D4"],["Tableau","tableau","#F59E0B"],["Pydantic","pydantic","#E92063"] ] },
  { code: "ML", tools: [
    ["DistilBERT","distilbert","#F59E0B"],["sentence-transformers","sentence","#14B8A6"],["TensorFlow","tensorflow","#FF6F00"],
    ["pgvector","pgvector","#4169E1"],["LoRA","lora","#C084FC"],["NASA APIs","nasa","#38BDF8"] ] },
  { code: "EDGE", tools: [
    ["Kotlin","kotlin","#A855F7"],["Jetpack Compose","compose","#3DDC84"],["ExecuTorch","executorch","#EE4C2C"],
    ["QNN","qnn","#22D3EE"],["Android","android","#3DDC84"],["Expo","expo","#8B5CF6"] ] },
  { code: "UI", tools: [
    ["Next.js","next","#f3edf8"],["React","react","#61DAFB"],["TypeScript","typescript","#3178C6"],
    ["Tailwind","tailwind","#38BDF8"],["Framer Motion","framer","#EC4899"],["Expo","expo","#8B5CF6"] ] },
  { code: "SYS", tools: [
    ["FastAPI","fastapi","#10B981"],["Postgres","postgres","#4169E1"],["Supabase","supabase","#3ECF8E"],
    ["Docker","docker","#2496ED"],["AWS","aws","#FF9900"],["Vercel","vercel","#A1A1AA"] ] },
]

const C = 450, R_CAT = 268, TOOL_ORBIT = 88
const r3 = (n) => Math.round(n * 1000) / 1000
const polar = (radius, deg) => {
  const rad = (deg * Math.PI) / 180
  return { x: r3(C + Math.cos(rad) * radius), y: r3(C + Math.sin(rad) * radius) }
}
const toolPos = (catDeg, ti, n) => {
  const catRad = (catDeg * Math.PI) / 180
  const hub = polar(R_CAT, catDeg)
  const localRad = (((360 / n) * ti - 90) * Math.PI) / 180
  const rot = catRad + Math.PI / 2
  const lx = TOOL_ORBIT * Math.cos(localRad), ly = TOOL_ORBIT * Math.sin(localRad)
  return { x: r3(hub.x + lx * Math.cos(rot) - ly * Math.sin(rot)), y: r3(hub.y + lx * Math.sin(rot) + ly * Math.cos(rot)) }
}

// --- icon markup (inner content of a 0 0 24 24 svg), ported from tech-logos.tsx ---
const word = (label, color, ts = 7) =>
  `<rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="${color}" stroke-width="1.7"/>` +
  `<text x="12" y="14.6" text-anchor="middle" fill="${color}" font-size="${ts}" font-weight="800" font-family="'JetBrains Mono',monospace">${label}</text>`

function iconInner(logo, color) {
  const bg = BG
  switch (logo) {
    case "react": return `<g fill="none" stroke="${color}" stroke-width="1.5"><ellipse cx="12" cy="12" rx="9" ry="3.4"/><ellipse cx="12" cy="12" rx="9" ry="3.4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.4" transform="rotate(120 12 12)"/></g><circle cx="12" cy="12" r="2" fill="${color}"/>`
    case "typescript": return `<rect x="3" y="3" width="18" height="18" rx="2" fill="${color}"/><text x="12" y="15.5" text-anchor="middle" fill="#141414" font-size="7" font-weight="700" font-family="'JetBrains Mono',monospace">TS</text>`
    case "tailwind": return `<path d="M4 12c2.2-4.4 5.2-5.7 9-3.8 1.4.7 2.4 1.9 4.1 1.5 1.1-.3 2-1 2.9-2.1-2.2 4.4-5.2 5.7-9 3.8-1.4-.7-2.4-1.9-4.1-1.5C5.8 10.2 4.9 10.9 4 12Zm0 5c2.2-4.4 5.2-5.7 9-3.8 1.4.7 2.4 1.9 4.1 1.5 1.1-.3 2-1 2.9-2.1-2.2 4.4-5.2 5.7-9 3.8-1.4-.7-2.4-1.9-4.1-1.5C5.8 15.2 4.9 15.9 4 17Z" fill="${color}"/>`
    case "framer": return `<path d="M6 3h12v6H6V3Zm0 6h12l-6 6H6V9Zm0 6h6v6l-6-6Z" fill="${color}"/>`
    case "expo": return `<path d="M6 18 10.7 6.8c.5-1.2 2.1-1.2 2.6 0L18 18" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`
    case "python": return `<path d="M12 3c-4 0-5 1.4-5 4v2h6v1H5c-1.5 0-2.6 1.5-2.6 3.5S3.5 17 5 17h2v-3c0-2 1.5-3.5 3.5-3.5H15c1.1 0 2-.9 2-2V7c0-2.6-1-4-5-4Z" fill="${color}"/><path d="M12 21c4 0 5-1.4 5-4v-2h-6v-1h8c1.5 0 2.6-1.5 2.6-3.5S20.5 7 19 7h-2v3c0 2-1.5 3.5-3.5 3.5H9c-1.1 0-2 .9-2 2V17c0 2.6 1 4 5 4Z" fill="#F7D54A"/><circle cx="10" cy="6" r="1" fill="${bg}"/><circle cx="14" cy="18" r="1" fill="${bg}"/>`
    case "pytorch": return `<path d="M13 4 8.8 8.2a6 6 0 1 0 8.5.1" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round"/><circle cx="16.8" cy="5.8" r="1.8" fill="${color}"/>`
    case "huggingface": return `<circle cx="12" cy="12" r="8.5" fill="${color}"/><circle cx="9" cy="10" r="1.2" fill="${bg}"/><circle cx="15" cy="10" r="1.2" fill="${bg}"/><path d="M8.5 14.2c2 2 5 2 7 0" fill="none" stroke="${bg}" stroke-width="1.7" stroke-linecap="round"/><path d="M4.7 8.5 2.5 6.7m16.8 1.8 2.2-1.8" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`
    case "claude": return `<path d="M12 3.5 14.1 10l6.4 2-6.4 2L12 20.5 9.9 14l-6.4-2 6.4-2L12 3.5Z" fill="${color}"/><circle cx="12" cy="12" r="2.3" fill="${bg}" opacity="0.85"/>`
    case "langgraph": return `<g fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round"><path d="M7 7h10M7 7v10M17 7v10M7 17h10M7 7l10 10"/><circle cx="7" cy="7" r="2.3" fill="${bg}"/><circle cx="17" cy="7" r="2.3" fill="${bg}"/><circle cx="7" cy="17" r="2.3" fill="${bg}"/><circle cx="17" cy="17" r="2.3" fill="${bg}"/></g>`
    case "duckdb": return `<ellipse cx="12" cy="6" rx="6.5" ry="3" fill="none" stroke="${color}" stroke-width="1.8"/><path d="M5.5 6v10c0 1.7 2.9 3 6.5 3s6.5-1.3 6.5-3V6" fill="none" stroke="${color}" stroke-width="1.8"/><path d="M5.5 11c0 1.7 2.9 3 6.5 3s6.5-1.3 6.5-3" fill="none" stroke="${color}" stroke-width="1.8"/>`
    case "fastapi": return `<circle cx="12" cy="12" r="9" fill="${color}"/><path d="M13.2 4.8 7.8 13h3.4l-1 6.2 6-8.5h-3.5l.5-5.9Z" fill="${bg}"/>`
    case "postgres": return `<ellipse cx="12" cy="6" rx="6.8" ry="3" fill="none" stroke="${color}" stroke-width="1.8"/><path d="M5.2 6v10c0 1.7 3 3.1 6.8 3.1s6.8-1.4 6.8-3.1V6M5.2 11c0 1.7 3 3.1 6.8 3.1s6.8-1.4 6.8-3.1" fill="none" stroke="${color}" stroke-width="1.8"/>`
    case "supabase": return `<path d="M13 3 5 13h6l-1 8 9-11h-6l0-7Z" fill="${color}"/>`
    case "docker": return `<g fill="${color}"><rect x="4" y="10" width="3" height="3" rx=".4"/><rect x="8" y="10" width="3" height="3" rx=".4"/><rect x="12" y="10" width="3" height="3" rx=".4"/><rect x="8" y="6" width="3" height="3" rx=".4"/><rect x="12" y="6" width="3" height="3" rx=".4"/><path d="M3 14h15.5c-.7 3-3.4 5-7.6 5C7.2 19 4.5 17.5 3 14Z"/><path d="M18 10.5c1.3 0 2.2.7 2.9 1.8-1 .5-2.1.6-3.2.3.1-.8.2-1.5.3-2.1Z"/></g>`
    case "aws": return `<text x="12" y="11.5" text-anchor="middle" fill="${color}" font-size="7" font-weight="900" font-family="'JetBrains Mono',monospace">AWS</text><path d="M7 15c3 2 7 2 10 0" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/><path d="M16.4 14.5 18 15l-.7 1.5" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>`
    case "vercel": return `<path d="M12 4 22 20H2L12 4Z" fill="${color}"/>`
    case "tableau": return `<g stroke="${color}" stroke-width="1.6" stroke-linecap="round"><path d="M12 3v5M9.5 5.5h5M12 16v5M9.5 18.5h5M3 12h5M5.5 9.5v5M16 12h5M18.5 9.5v5M6.2 6.2l3.5 3.5M8.7 4.7l-3.5 3.5M14.3 14.3l3.5 3.5M15.3 19.3l3.5-3.5"/></g>`
    case "android": return `<path d="M7 10h10v7.2c0 1-.8 1.8-1.8 1.8H8.8C7.8 19 7 18.2 7 17.2V10Z" fill="${color}"/><path d="M8 9a4 4 0 0 1 8 0M9 5.3 7.5 3.6M15 5.3l1.5-1.7" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/><circle cx="10" cy="13" r=".8" fill="${bg}"/><circle cx="14" cy="13" r=".8" fill="${bg}"/>`
    case "tensorflow": return `<path d="M12 3 4.5 7.2v8.6L12 20l7.5-4.2V7.2L12 3Z" fill="none" stroke="${color}" stroke-width="1.7"/><path d="M12 3v17M4.5 7.2 12 11.5l7.5-4.3M8.2 9.4v8.4" stroke="${color}" stroke-width="1.7" stroke-linecap="round"/>`
    case "kotlin": return `<path d="M4 4h16L12 12l8 8H4V4Z" fill="${color}"/><path d="M4 20 20 4" stroke="${bg}" stroke-width="1.5" opacity="0.7"/>`
    case "compose": return `<path d="M12 3 19.5 7.5v9L12 21l-7.5-4.5v-9L12 3Z" fill="none" stroke="${color}" stroke-width="1.8"/><path d="M12 3v18M4.5 7.5 12 12l7.5-4.5M4.5 16.5 12 12l7.5 4.5" stroke="${color}" stroke-width="1.4"/>`
    case "pydantic": return word("PYD", color, 6.4)
    case "distilbert": return word("BERT", color, 5.6)
    case "sentence": return word("ST", color)
    case "parquet": return word("PQ", color)
    case "tesseract": return word("OCR", color, 6.5)
    case "openpyxl": return word("XL", color)
    case "pdfplumber": return word("PDF", color, 6.2)
    case "executorch": return word("ET", color)
    case "qnn": return word("QNN", color, 6.5)
    case "nasa": return word("NASA", color, 5.6)
    case "pgvector": return word("VEC", color, 6.3)
    case "lora": return word("LoRA", color, 5.4)
    default: return `<circle cx="12" cy="12" r="9" fill="none" stroke="${color}" stroke-width="1.7" opacity="0.9"/><path d="M8 17V7l8 10V7" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
  }
}

const NODE_R = 22, ICON = 30, HUB_R = 34
let lines = "", tools = "", hubs = ""

groups.forEach((g, ci) => {
  const angle = -90 + ci * (360 / groups.length)
  const hub = polar(R_CAT, angle)
  // center -> hub spoke
  lines += `<line x1="${C}" y1="${C}" x2="${hub.x}" y2="${hub.y}" stroke="${GOLD}" stroke-width="1" stroke-opacity="0.28" stroke-dasharray="3 6"/>`
  g.tools.forEach((t, ti) => {
    const [, logo, color] = t
    const p = toolPos(angle, ti, g.tools.length)
    // hub -> tool spoke
    lines += `<line x1="${hub.x}" y1="${hub.y}" x2="${p.x}" y2="${p.y}" stroke="${color}" stroke-width="1" stroke-opacity="0.32"/>`
    // Radiating ripple emanating from each tool node — staggered so the
    // whole graph shimmers like a wave rather than pulsing in unison.
    const delay = (((ci * 6 + ti) % 12) * 0.22).toFixed(2)
    tools += `<g>`
      + `<circle cx="${p.x}" cy="${p.y}" r="${NODE_R}" fill="none" stroke="${color}" stroke-width="1.4">`
        + `<animate attributeName="r" values="${NODE_R};${NODE_R + 15}" dur="2.6s" begin="${delay}s" repeatCount="indefinite"/>`
        + `<animate attributeName="stroke-opacity" values="0.55;0" dur="2.6s" begin="${delay}s" repeatCount="indefinite"/>`
      + `</circle>`
      + `<circle cx="${p.x}" cy="${p.y}" r="${NODE_R}" fill="${BG}" stroke="${color}" stroke-width="1.6" stroke-opacity="0.92">`
        + `<animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="2.6s" begin="${delay}s" repeatCount="indefinite"/>`
      + `</circle>`
      + `<svg x="${r3(p.x - ICON / 2)}" y="${r3(p.y - ICON / 2)}" width="${ICON}" height="${ICON}" viewBox="0 0 24 24">${iconInner(logo, color)}</svg>`
      + `</g>`
  })
  // hub node (drawn above tool spokes)
  const hubDelay = (ci * 0.4).toFixed(2)
  hubs += `<g>`
    + `<circle cx="${hub.x}" cy="${hub.y}" r="${HUB_R}" fill="none" stroke="${GOLD}" stroke-width="1.5">`
      + `<animate attributeName="r" values="${HUB_R};${HUB_R + 22}" dur="3.2s" begin="${hubDelay}s" repeatCount="indefinite"/>`
      + `<animate attributeName="stroke-opacity" values="0.5;0" dur="3.2s" begin="${hubDelay}s" repeatCount="indefinite"/>`
    + `</circle>`
    + `<circle cx="${hub.x}" cy="${hub.y}" r="${HUB_R + 6}" fill="none" stroke="${GOLD}" stroke-width="1" stroke-opacity="0.16"/>`
    + `<circle cx="${hub.x}" cy="${hub.y}" r="${HUB_R}" fill="${PANEL}" stroke="${GOLD}" stroke-width="1.5"/>`
    + `<text x="${hub.x}" y="${hub.y + 4.5}" text-anchor="middle" fill="${GOLD}" font-size="13" font-weight="700" letter-spacing="0.5" font-family="'JetBrains Mono',monospace">${g.code}</text>`
    + `</g>`
})

const coreRipple = (begin) =>
  `<circle cx="${C}" cy="${C}" r="54" fill="none" stroke="${GOLD}" stroke-width="1.6">`
  + `<animate attributeName="r" values="54;104" dur="3.6s" begin="${begin}" repeatCount="indefinite"/>`
  + `<animate attributeName="stroke-opacity" values="0.55;0" dur="3.6s" begin="${begin}" repeatCount="indefinite"/>`
  + `</circle>`

const core =
  `<circle cx="${C}" cy="${C}" r="88" fill="url(#coreGlow)"/>`
  + coreRipple("0s") + coreRipple("1.8s")
  + `<circle cx="${C}" cy="${C}" r="54" fill="${PANEL}" stroke="${GOLD}" stroke-width="1.6"/>`
  + `<circle cx="${C}" cy="${C}" r="64" fill="none" stroke="${GOLD}" stroke-width="1" stroke-opacity="0.35"/>`
  + `<text x="${C}" y="${C - 2}" text-anchor="middle" fill="${TEXT}" font-size="30" font-weight="700" font-family="'Cormorant Garamond',Georgia,serif">AI</text>`
  + `<text x="${C}" y="${C + 18}" text-anchor="middle" fill="${MUTED}" font-size="10" letter-spacing="4" font-family="'JetBrains Mono',monospace">CORE</text>`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900" width="900" height="900" role="img" aria-label="AI ecosystem tech stack">
<defs>
<radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
<stop offset="0%" stop-color="${GOLD}" stop-opacity="0.22"/>
<stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
</radialGradient>
<radialGradient id="bgGlow" cx="50%" cy="50%" r="60%">
<stop offset="0%" stop-color="#161b26" stop-opacity="1"/>
<stop offset="100%" stop-color="#0d1117" stop-opacity="1"/>
</radialGradient>
</defs>
<rect x="0" y="0" width="900" height="900" rx="24" fill="url(#bgGlow)"/>
<g>${lines}</g>
<g>${tools}</g>
<g>${hubs}</g>
<g>${core}</g>
</svg>
`

writeFileSync(new URL("./readme-banners/tech-stack.svg", import.meta.url), svg)
console.log("wrote readme-banners/tech-stack.svg", svg.length, "bytes")
