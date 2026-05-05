import express from 'express'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { computeStandingsFromRoundScores } from './compute.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DATA_PATH = path.join(ROOT, 'data', 'tournament-state.json')

const ROUND_IDS = Array.from({ length: 10 }, (_, i) => `r${i + 1}`)

const app = express()

/** Cho phép trang trên Vercel gọi API host khác (chỉ cần khi tách frontend / backend). */
app.use((req, res, next) => {
  const allow =
    process.env.CORS_ORIGIN ||
    (process.env.NODE_ENV === 'production' ? '*' : undefined)
  if (allow) {
    res.setHeader('Access-Control-Allow-Origin', allow)
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  }
  if (req.method === 'OPTIONS') {
    res.sendStatus(204)
    return
  }
  next()
})

app.use(express.json({ limit: '512kb' }))

async function readState() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8')
    const j = JSON.parse(raw)
    if (j && typeof j.scores === 'object' && j.scores !== null) return j
  } catch {
    // no file yet
  }
  return { scores: {} }
}

async function writeState(state) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true })
  await fs.writeFile(DATA_PATH, JSON.stringify(state, null, 2), 'utf8')
}

function standingsFromScores(scoresMap) {
  const roundsForCompute = ROUND_IDS.map((id) => {
    const s = scoresMap[id] || {}
    return {
      scoreCourtOne: s.courtOne,
      scoreCourtTwo: s.courtTwo,
    }
  })
  return computeStandingsFromRoundScores(roundsForCompute)
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/state', async (_req, res) => {
  try {
    const state = await readState()
    const scores = state.scores || {}
    const standings = standingsFromScores(scores)
    res.json({ scores, standings })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'read_failed' })
  }
})

app.put('/api/state', async (req, res) => {
  try {
    const body = req.body
    if (!body || typeof body.scores !== 'object' || body.scores === null) {
      res.status(400).json({ error: 'invalid_body' })
      return
    }
    const state = { scores: body.scores }
    await writeState(state)
    const standings = standingsFromScores(state.scores)
    res.json({ scores: state.scores, standings, saved: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'write_failed' })
  }
})

const DIST = path.join(ROOT, 'dist')
const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  app.use(express.static(DIST))
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      next()
      return
    }
    if (req.method !== 'GET') {
      next()
      return
    }
    res.sendFile(path.join(DIST, 'index.html'), (err) => {
      if (err) next(err)
    })
  })
}

const PORT = Number(process.env.PORT || 5050)
/** Railway/Docker cần 0.0.0.0; chỉ 127.0.0.1 → proxy báo 502. */
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1')

/** Keep Node alive when spawned under tools that close stdin (e.g. some runners). */
if (process.stdin.isTTY !== true) {
  try {
    process.stdin.resume()
  } catch {
    // ignore
  }
}

const server = app.listen(PORT, HOST, () => {
  console.log(`[server] http://${HOST}:${PORT}`)
  if (!isProd) console.log('[server] dev: serve API only; Vite proxies /api')
})

server.on('error', (err) => {
  console.error('[server] listen error:', err.message)
  process.exit(1)
})
