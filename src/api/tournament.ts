import type { TeamStandingRow } from '../data/roster'

export type RoundScores = {
  courtOne?: string
  courtTwo?: string
}

export type ScoresMap = Record<string, RoundScores>

export type TournamentApiState = {
  scores: ScoresMap
  standings: TeamStandingRow[]
  saved?: boolean
}

/** Luôn cùng origin — tránh CORS khi `VITE_API_BASE_URL` trỏ nhầm host khác. */
function stateEndpoint() {
  return '/api/state'
}

export async function fetchTournamentState(): Promise<TournamentApiState | null> {
  try {
    const r = await fetch(stateEndpoint())
    if (!r.ok) return null
    return (await r.json()) as TournamentApiState
  } catch {
    return null
  }
}

export type SaveScoresResult =
  | { ok: true; data: TournamentApiState }
  | { ok: false; error?: string; hint?: string }

export async function saveTournamentScores(scores: ScoresMap): Promise<SaveScoresResult> {
  try {
    const r = await fetch(stateEndpoint(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scores }),
    })
    if (!r.ok) {
      const err = (await r.json().catch(() => null)) as { error?: string; hint?: string } | null
      return { ok: false, error: err?.error, hint: err?.hint }
    }
    const data = (await r.json()) as TournamentApiState
    return { ok: true, data }
  } catch {
    return { ok: false }
  }
}
