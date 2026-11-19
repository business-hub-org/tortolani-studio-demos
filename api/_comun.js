// Fotos reales en vivo desde Google Places (API New).
// Google no permite guardar ni cachear su contenido (salvo el place_id), pero sí mostrarlo
// con atribución. Por eso esto se consulta en cada visita y no se guarda nada.
const fs = require('fs')
const path = require('path')

const DOMINIO = /^([a-z0-9-]+)\.tortolanistudio\.com$/
const SLUG = /^[a-z0-9-]{1,60}$/

// La demo se identifica por el subdominio (o ?demo=<slug> en las URLs de vercel.app).
function demoDe(req) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(':')[0].toLowerCase()
  const m = host.match(DOMINIO)
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
