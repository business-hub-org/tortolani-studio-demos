// GET /api/lugar → { fotos: [{ src, autor, autorUrl }] } del negocio de esta demo (máx. 8).
const { demoDe, sinCache, google } = require('./_comun')

module.exports = async (req, res) => {
  sinCache(res)
  const demo = demoDe(req)
  if (!demo) return res.status(404).json({ fotos: [] })
  try {
    const lugar = await google(`https://places.googleapis.com/v1/places/${demo.placeId}`)
    const fotos = (lugar.photos || []).slice(0, 8).map((f) => {
      const a = (f.authorAttributions || [])[0] || {}
      const q = new URLSearchParams({ n: f.name })
      if (req.query.demo) q.set('demo', demo.slug)
      return { src: `/api/foto?${q}`, autor: a.displayName || '', autorUrl: a.uri || '' }
    })
    res.status(200).json({ fotos })
  } catch (e) {
    console.error('lugar:', demo.slug, e.message)
    res.status(200).json({ fotos: [] }) // la página usa sus imágenes de respaldo
  }
}
