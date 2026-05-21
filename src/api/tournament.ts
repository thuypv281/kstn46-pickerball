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

/** Luôn gọi API trên cùng domain với trang web — không dùng Railway / VITE_API_BASE_URL. */
export function stateEndpoint(): string {
  if (typeof window !== 'undefined') {
    return new URL('/api/state', window.location.origin).href
  }
  return '/api/state'
}

export async function fetchTournamentState(): Promise<TournamentApiState | null> {
  try {
    const r = await fetch(stateEndpoint(), { cache: 'no-store' })
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
      cache: 'no-store',
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
