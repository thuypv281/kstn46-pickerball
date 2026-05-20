import { TEAM_A_NAME, TEAM_B_NAME } from './teams.mjs'

/**
 * Parse tỷ số dạng «11–8»: số đầu = Đội A, số sau = Đội B (chấm đến 11 hoặc tự do).
 * @param {string | undefined} raw
 * @returns {{ hoai: number; huyen: number } | null}
 */
export function parseDoublesScore(raw) {
  if (!raw || typeof raw !== 'string') return null
  const t = raw.trim()
  if (!t) return null
  const nums = t.replace(/[–—]/g, '-').match(/\d+/g)
  if (!nums || nums.length < 2) return null
  const hoai = Number.parseInt(nums[0], 10)
  const huyen = Number.parseInt(nums[1], 10)
  if (Number.isNaN(hoai) || Number.isNaN(huyen)) return null
  return { hoai, huyen }
}

/**
 * @param {Array<{ scoreCourtOne?: string; scoreCourtTwo?: string }>} rounds
 */
export function computeStandingsFromRoundScores(rounds) {
  let hoaiW = 0
  let hoaiL = 0
  let hyW = 0
  let hyL = 0
  let played = 0

  /** Tổng điểm ghi trong trận thắng / trận thua (điểm rally theo từng đội). */
  let hoaiPtsInWins = 0
  let hoaiPtsInLosses = 0
  let hyPtsInWins = 0
  let hyPtsInLosses = 0
  /** Tổng điểm ghi − đối thủ (mọi trận). */
  let hoaiDiff = 0
  let hyDiff = 0

  for (const r of rounds) {
    for (const key of ['scoreCourtOne', 'scoreCourtTwo']) {
      const p = parseDoublesScore(r[key])
      if (!p) continue
      played += 1
      hoaiDiff += p.hoai - p.huyen
      hyDiff += p.huyen - p.hoai

      if (p.hoai > p.huyen) {
        hoaiW += 1
        hyL += 1
        hoaiPtsInWins += p.hoai
        hyPtsInLosses += p.huyen
      } else if (p.huyen > p.hoai) {
        hyW += 1
        hoaiL += 1
        hyPtsInWins += p.huyen
        hoaiPtsInLosses += p.hoai
      }
    }
  }

  const teamHoai = {
    rank: 1,
    name: TEAM_A_NAME,
    played,
    won: hoaiW,
    lost: hoaiL,
    points: hoaiW,
    pointsInWins: hoaiPtsInWins,
    pointsInLosses: hoaiPtsInLosses,
    pointDiff: hoaiDiff,
  }
  const teamHuyen = {
    rank: 2,
    name: TEAM_B_NAME,
    played,
    won: hyW,
    lost: hyL,
    points: hyW,
    pointsInWins: hyPtsInWins,
    pointsInLosses: hyPtsInLosses,
    pointDiff: hyDiff,
  }
  const sorted = [teamHoai, teamHuyen].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.won !== a.won) return b.won - a.won
    if (a.lost !== b.lost) return a.lost - b.lost
    if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff
    return 0
  })
  sorted.forEach((row, i) => {
    row.rank = i + 1
  })
  return sorted
}
