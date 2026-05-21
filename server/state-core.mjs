import { computeStandingsFromRoundScores } from './compute.mjs'
import { ROUND_IDS } from './teams.mjs'

/** @param {Record<string, { courtOne?: string; courtTwo?: string }>} scoresMap */
export function standingsFromScores(scoresMap) {
  const roundsForCompute = ROUND_IDS.map((id) => {
    const s = scoresMap[id] || {}
    return {
      scoreCourtOne: s.courtOne,
      scoreCourtTwo: s.courtTwo,
    }
  })
  return computeStandingsFromRoundScores(roundsForCompute)
}

/** @param {Record<string, { courtOne?: string; courtTwo?: string }>} scores */
export function buildStatePayload(scores) {
  return { scores, standings: standingsFromScores(scores) }
}
