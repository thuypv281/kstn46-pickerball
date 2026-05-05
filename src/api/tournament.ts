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

export async function fetchTournamentState(): Promise<TournamentApiState | null> {
  try {
    const r = await fetch('/api/state')
    if (!r.ok) return null
    return (await r.json()) as TournamentApiState
  } catch {
    return null
  }
}

export async function saveTournamentScores(scores: ScoresMap): Promise<TournamentApiState | null> {
  try {
    const r = await fetch('/api/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scores }),
    })
    if (!r.ok) return null
    return (await r.json()) as TournamentApiState
  } catch {
    return null
  }
}
