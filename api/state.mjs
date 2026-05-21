import { list, put } from '@vercel/blob'
import { buildStatePayload } from '../server/state-core.mjs'

const PATHNAME = 'tournament-state.json'

function setCors(req, res) {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : ''
  const allow = process.env.CORS_ORIGIN || origin || '*'
  res.setHeader('Access-Control-Allow-Origin', allow)
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (origin) res.setHeader('Vary', 'Origin')
}

function parseBody(req) {
  const body = req.body
  if (!body) return null
  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch {
      return null
    }
  }
  return body
}

function isStorageConfigError(e) {
  const msg = e instanceof Error ? e.message : String(e ?? '')
  return /no blob credentials|BLOB_READ_WRITE_TOKEN|BLOB_STORE_ID|blob_not_configured/i.test(msg)
}

/** @returns {Promise<Record<string, unknown>>} */
async function readScores() {
  try {
    const { blobs } = await list({ prefix: PATHNAME })
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
  await put(PATHNAME, JSON.stringify({ scores }, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  })
}

/** Vercel Serverless — GET/PUT /api/state (cùng domain với frontend). */
export default async function handler(req, res) {
  setCors(req, res)
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  try {
    if (req.method === 'GET') {
      const scores = await readScores()
      res.status(200).json(buildStatePayload(scores))
      return
    }

    if (req.method === 'PUT') {
      const body = parseBody(req)
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
    if (isStorageConfigError(e)) {
      res.status(503).json({
        error: 'storage_not_configured',
        hint: 'Vercel → Storage → Blob → Connect to project itg-pickerball → Redeploy.',
      })
      return
    }
    console.error('[api/state]', e)
    res.status(500).json({ error: 'server_error' })
  }
}
