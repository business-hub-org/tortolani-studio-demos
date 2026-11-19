// Fotos reales en vivo desde Google Places (API New).
// Google no permite guardar ni cachear su contenido (salvo el place_id), pero sí mostrarlo
// con atribución. Por eso esto se consulta en cada visita y no se guarda nada.
const fs = require('fs')
const path = require('path')

const DOMINIO = /^([a-z0-9-]+)\.tortolanistudio\.com$/
const SLUG = /^[a-z0-9-]{1,60}$/

// La demo se identifica por el subdominio (o ?demo=<slug> en las URLs de vercel.app).
function hostDe(valor) {
  // "a.com, b.com" → "a.com"; "https://a.com/x" → "a.com"; sin puerto
  let v = String(valor || '').split(',')[0].trim().toLowerCase()
  try { if (v.includes('://')) v = new URL(v).hostname } catch { return '' }
  return v.split(':')[0]
}

function demoDe(req) {
  const h = req.headers
  const candidatos = [h['x-forwarded-host'], h.host, h.referer, h.origin].map(hostDe)
  const m = candidatos.map((x) => x.match(DOMINIO)).find(Boolean)
  const slug = m ? m[1] : String(req.query.demo || '')
  if (!SLUG.test(slug)) return null
  try {
    const d = JSON.parse(fs.readFileSync(path.join(process.cwd(), slug, 'demo.json'), 'utf8'))
    return d.place_id && /^[A-Za-z0-9_-]{10,}$/.test(d.place_id) ? { slug, placeId: d.place_id } : null
  } catch { return null }
}

function sinCache(res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')
}

async function google(url) {
  const key = process.env.GOOGLE_PLACES_KEY
  if (!key) throw new Error('falta GOOGLE_PLACES_KEY')
  const r = await fetch(url, { headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'photos' } })
  if (!r.ok) throw new Error(`Google respondió ${r.status}`)
  return r.json()
}

module.exports = { demoDe, sinCache, google }
