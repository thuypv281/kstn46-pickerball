import { list, put } from '@vercel/blob'
import { buildStatePayload } from '../server/state-core.mjs'

const PATHNAME = 'tournament-state.json'

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

async function readScores() {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) return null

  try {
    const { blobs } = await list({ prefix: PATHNAME, token })
    const blob = blobs.find((b) => b.pathname === PATHNAME)
    if (!blob) return {}
    const r = await fetch(blob.url)
    if (!r.ok) return {}
    const j = await r.json()
    if (j && typeof j.scores === 'object' && j.scores !== null) return j.scores
    return {}
  } catch (e) {
    if (e?.name === 'BlobNotFoundError') return {}
    throw e
  }
}

/** @param {Record<string, unknown>} scores */
async function writeScores(scores) {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    const err = new Error('blob_not_configured')
    err.code = 'blob_not_configured'
    throw err
  }
  await put(PATHNAME, JSON.stringify({ scores }, null, 2), {
    access: 'public',
    token,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  })
}

/** Vercel Serverless — GET/PUT /api/state (cùng domain với frontend). */
export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  try {
    if (req.method === 'GET') {
      const scores = (await readScores()) ?? {}
      res.status(200).json(buildStatePayload(scores))
      return
    }

    if (req.method === 'PUT') {
      const body = req.body
      if (!body || typeof body.scores !== 'object' || body.scores === null) {
        res.status(400).json({ error: 'invalid_body' })
        return
      }
      await writeScores(body.scores)
      res.status(200).json({ ...buildStatePayload(body.scores), saved: true })
      return
    }

    res.status(405).json({ error: 'method_not_allowed' })
  } catch (e) {
    if (e?.code === 'blob_not_configured' || e?.message === 'blob_not_configured') {
      res.status(503).json({
        error: 'storage_not_configured',
        hint: 'Vercel → Storage → Blob → Connect to project, rồi Redeploy.',
      })
      return
    }
    console.error('[api/state]', e)
    res.status(500).json({ error: 'server_error' })
  }
}
