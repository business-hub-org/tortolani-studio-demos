// GET /api/foto?n=places/<id>/photos/<ref>&w=1200 → redirige a la foto (solo de ESTA demo).
const { demoDe, sinCache } = require('./_comun')

module.exports = async (req, res) => {
  sinCache(res)
  const demo = demoDe(req)
  const n = String(req.query.n || '')
  if (!demo || !n.startsWith(`places/${demo.placeId}/photos/`) || !/^[A-Za-z0-9_/-]+$/.test(n)) return res.status(404).end()
  const w = Math.min(Math.max(parseInt(req.query.w, 10) || 1200, 200), 1600)
  try {
    const r = await fetch(`https://places.googleapis.com/v1/${n}/media?maxWidthPx=${w}&skipHttpRedirect=true`,
      { headers: { 'X-Goog-Api-Key': process.env.GOOGLE_PLACES_KEY || '' } })
    if (!r.ok) throw new Error(`Google respondió ${r.status}`)
    const { photoUri } = await r.json()
    if (!photoUri) throw new Error('sin photoUri')
    res.setHeader('Location', photoUri)
    res.status(302).end()
  } catch (e) {
    console.error('foto:', demo.slug, e.message)
    res.status(404).end()
  }
}
