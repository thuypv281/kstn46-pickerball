/**
 * Giải 7 vòng × 2 sân — 7 Hoài × 7 Huyền, mỗi VĐV đúng 4 trận.
 *
 * (1) Không lặp cùng một cặp đấu (đôi Hoài + đôi Huyền).
 * (2) Mỗi đôi đồng đội (hai người một bên) tối đa 2 trận trong cả giải.
 * (3) Cùng một đôi đồng đội (cùng phía) không xuất hiện hai vòng liên tiếp.
 * (4) Không VĐV nào đánh ba vòng liên tiếp trên một phía (Hoài và Huyền riêng).
 * (5) Mỗi sân: chênh bậc hai đội không quá 1 — |tb chỉ số vị trí trong HOAI / HUYEN của hai đội trong trận| ≤ 1 ⇔ |tổng chỉ số đôi Hoài − tổng đôi Huyền| ≤ 2 (chỉ số = thứ tự trong HOAI/HUYEN).
 *
 * Lưu: Cấm «một VĐV không được đánh hai vòng liên tiếp» thì không tương thích
 * đồng thời với đủ 4 người/phía và mọi người 4 trận trong 7 vòng — xem roster.ts.
 *
 * Sinh: node scripts/generate-schedule.mjs
 */
const HOAI = ['Thuỷ', 'Thành', 'HoàngNH', 'Vũ', 'Gianh', 'Thủy Tini', 'Dương']
/** Cùng thứ tự = bậc 0…6; dùng trong ràng buộc chênh bậc trên mỗi sân. */
const HUYEN = ['Trung', 'An', 'Tiến', 'Lâm', 'Hùng', 'Diễn', 'Huyền']

const PLAYERS_SIDE = 7
const NUM_ROUNDS = 7
const GAMES_PER_PLAYER = 4
const MAX_PAIR_GAMES = 2
/** |(Σ bậc Hoài của sàn) − (Σ bậc Huyền của sàn)| tối đa ⇒ chênh trung bình bậc của hai đôi trong trận ≤ 1. */
const MAX_ABS_TIER_SUM_GAP = 2

/** Cạnh không hướng 0..20 */
function buildEdges() {
  const e = []
  for (let a = 0; a < PLAYERS_SIDE; a++)
    for (let b = a + 1; b < PLAYERS_SIDE; b++) e.push([a, b])
  return e
}
const EDGES = buildEdges()

/** Hai cạnh rời nhau → hai sân trên một phía */
function buildSideLayouts() {
  const layouts = []
  for (let i = 0; i < EDGES.length; i++) {
    for (let j = i + 1; j < EDGES.length; j++) {
      const u = new Set([...EDGES[i], ...EDGES[j]])
      if (u.size !== 4) continue
      layouts.push({ e1: i, e2: j })
    }
  }
  return layouts
}
const LAYOUTS = buildSideLayouts()
const NH = LAYOUTS.length

function buildSucc() {
  const s = []
  for (let i = 0; i < NH; i++) {
    const ban = new Set([LAYOUTS[i].e1, LAYOUTS[i].e2])
    const row = []
    for (let j = 0; j < NH; j++) {
      const { e1, e2 } = LAYOUTS[j]
      if (!ban.has(e1) && !ban.has(e2)) row.push(j)
    }
    s.push(row)
  }
  return s
}
const SUCC = buildSucc()

/** Tổng chỉ số bậc (0..6) trên một cạnh đôi — trùng với tổng index trong HOAI/HUYEN. */
function edgeSumTierIds(eid) {
  const [a, b] = EDGES[eid]
  return a + b
}

/** Một sân: một cạnh Hoài × một cạnh Huyền — chênh tổng bậc hai đôi ≤ MAX_ABS_TIER_SUM_GAP. */
function tiersOkForCourt(hEdgeId, yEdgeId) {
  return (
    Math.abs(edgeSumTierIds(hEdgeId) - edgeSumTierIds(yEdgeId)) <=
    MAX_ABS_TIER_SUM_GAP
  )
}

/** Cả hai sân trong (hi, yi, sw) đều thỏa ràng buộc bậc. */
function matchupTierCompatible(hi, yi, sw) {
  const H = LAYOUTS[hi]
  const Y = LAYOUTS[yi]
  if (!sw) {
    return tiersOkForCourt(H.e1, Y.e1) && tiersOkForCourt(H.e2, Y.e2)
  }
  return tiersOkForCourt(H.e1, Y.e2) && tiersOkForCourt(H.e2, Y.e1)
}

function verticesOfLayout(li) {
  const { e1, e2 } = LAYOUTS[li]
  return [...EDGES[e1], ...EDGES[e2]]
}

/** Cặp tên có thể từ cạnh và danh bạ team */
function pairLabel(team, ei) {
  const [a, b] = EDGES[ei]
  const x = team[a]
  const y = team[b]
  return x.localeCompare(y, 'vi') < 0 ? `${x}|${y}` : `${y}|${x}`
}

function matchKey(teamH, he, teamY, ye) {
  return `${pairLabel(teamH, he)}::${pairLabel(teamY, ye)}`
}

/** Hai khoá trận của một lượt (hi, yi, sw) */
function roundMatchKeys(hi, yi, sw) {
  const { e1: h1e, e2: h2e } = LAYOUTS[hi]
  const { e1: y1e, e2: y2e } = LAYOUTS[yi]
  if (!sw)
    return [matchKey(HOAI, h1e, HUYEN, y1e), matchKey(HOAI, h2e, HUYEN, y2e)]
  return [matchKey(HOAI, h1e, HUYEN, y2e), matchKey(HOAI, h2e, HUYEN, y1e)]
}

function sortCourt(team, ei) {
  const [a, b] = EDGES[ei]
  const x = team[a]
  const y = team[b]
  return team.indexOf(x) < team.indexOf(y) ? [x, y] : [y, x]
}

function courtRound(hi, yi, sw) {
  const { e1: h1e, e2: h2e } = LAYOUTS[hi]
  const { e1: y1e, e2: y2e } = LAYOUTS[yi]
  let co1Ho, co1Hy, ctHo, ctHy
  if (!sw) {
    co1Ho = sortCourt(HOAI, h1e)
    co1Hy = sortCourt(HUYEN, y1e)
    ctHo = sortCourt(HOAI, h2e)
    ctHy = sortCourt(HUYEN, y2e)
  } else {
    co1Ho = sortCourt(HOAI, h1e)
    co1Hy = sortCourt(HUYEN, y2e)
    ctHo = sortCourt(HOAI, h2e)
    ctHy = sortCourt(HUYEN, y1e)
  }
  return {
    courtOne: { hoai: co1Ho, huyen: co1Hy },
    courtTwo: { hoai: ctHo, huyen: ctHy },
  }
}

function mulberry32(a) {
  return function rng() {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffleInPlace(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Đã chơi hai vòng liền trước → thêm vòng `depth` sẽ thành 3 vòng liên tiếp. */
function wouldBeThreeRuns(roundsPlayed, depth) {
  if (depth < 2) return false
  return roundsPlayed.includes(depth - 1) && roundsPlayed.includes(depth - 2)
}

const emptyHist = () => Array.from({ length: PLAYERS_SIDE }, () => [])

/** Las Vegas: ghép từng vòng bằng cách chọn ngẫu nhiên trong tập nước hợp lệ. */
function randomTrial(seed) {
  const rng = mulberry32(seed ^ 48271)
  const hoPlays = Array(PLAYERS_SIDE).fill(0)
  const hyPlays = Array(PLAYERS_SIDE).fill(0)
  const hoHist = emptyHist()
  const hyHist = emptyHist()
  const hoEdgeUse = Array(21).fill(0)
  const hyEdgeUse = Array(21).fill(0)
  const used = new Set()
  const path = []
  let prevHi = 0
  let prevYi = 0

  for (let depth = 0; depth < NUM_ROUNDS; depth++) {
    const opts = []
    const hiList = depth === 0 ? [...Array(NH).keys()] : [...SUCC[prevHi]]
    shuffleInPlace(hiList, rng)

    hiOuter: for (const hi of hiList) {
      const vertsH = verticesOfLayout(hi)
      for (const v of vertsH) {
        if (hoPlays[v] >= GAMES_PER_PLAYER) continue hiOuter
        if (wouldBeThreeRuns(hoHist[v], depth)) continue hiOuter
      }

      const { e1: he1, e2: he2 } = LAYOUTS[hi]
      if (hoEdgeUse[he1] >= MAX_PAIR_GAMES || hoEdgeUse[he2] >= MAX_PAIR_GAMES)
        continue hiOuter

      const yiList = depth === 0 ? [...Array(NH).keys()] : [...SUCC[prevYi]]
      shuffleInPlace(yiList, rng)

      yiOuter: for (const yi of yiList) {
        const vertsY = verticesOfLayout(yi)
        for (const v of vertsY) {
          if (hyPlays[v] >= GAMES_PER_PLAYER) continue yiOuter
          if (wouldBeThreeRuns(hyHist[v], depth)) continue yiOuter
        }

        const { e1: ye1, e2: ye2 } = LAYOUTS[yi]
        if (hyEdgeUse[ye1] >= MAX_PAIR_GAMES || hyEdgeUse[ye2] >= MAX_PAIR_GAMES)
          continue yiOuter

        for (const sw of [0, 1]) {
          if (!matchupTierCompatible(hi, yi, sw)) continue
          const [m1, m2] = roundMatchKeys(hi, yi, sw)
          if (used.has(m1) || used.has(m2)) continue
          opts.push({ hi, yi, sw, vertsH, vertsY, he1, he2, ye1, ye2, m1, m2 })
        }
      }
    }

    if (opts.length === 0) return null

    shuffleInPlace(opts, rng)
    const picked = opts[Math.floor(rng() * opts.length)]

    for (const v of picked.vertsH) {
      hoPlays[v]++
      hoHist[v].push(depth)
    }
    hoEdgeUse[picked.he1]++
    hoEdgeUse[picked.he2]++

    for (const v of picked.vertsY) {
      hyPlays[v]++
      hyHist[v].push(depth)
    }
    hyEdgeUse[picked.ye1]++
    hyEdgeUse[picked.ye2]++

    used.add(picked.m1)
    used.add(picked.m2)
    path.push([picked.hi, picked.yi, picked.sw])
    prevHi = picked.hi
    prevYi = picked.yi
  }

  for (let i = 0; i < PLAYERS_SIDE; i++) {
    if (hoPlays[i] !== GAMES_PER_PLAYER || hyPlays[i] !== GAMES_PER_PLAYER) return null
  }
  return path
}

function timeSlots() {
  const startMin = 15 * 60 + 15
  /** Mỗi lượt trên lịch: 15′ thi đấu + 3′ nghỉ trước lượt tiếp → 18′ / lượt. */
  const blockMin = 15 + 3
  const fmt = (m) => {
    const h = Math.floor(m / 60)
    const mm = Math.round(m % 60)
    return `${h}h${String(mm).padStart(2, '0')}`
  }
  const out = []
  for (let i = 0; i < NUM_ROUNDS; i++) {
    const a = startMin + i * blockMin
    const b = startMin + (i + 1) * blockMin
    out.push(`${fmt(a)}–${fmt(b)}`)
  }
  return out
}

let foundPath = null
for (let seed = 1; seed < 35_000_000 && !foundPath; seed++) {
  foundPath = randomTrial(seed)
}

if (!foundPath) {
  console.error('Không tìm thấy lịch thoả ràng buộc')
  process.exit(1)
}

const slots = timeSlots()
const scheduleRounds = foundPath.map(([hi, yi, sw], ri) => ({
  id: `r${ri + 1}`,
  timeSlot: slots[ri],
  ...courtRound(hi, yi, sw),
}))

function sumTierCourts(pair, roster) {
  let s = 0
  for (const n of pair) {
    const i = roster.indexOf(n)
    if (i < 0) throw new Error(`Unknown name: ${n}`)
    s += i
  }
  return s
}

function verifyMatchupTierBands(rounds) {
  for (const r of rounds) {
    for (const ct of [r.courtOne, r.courtTwo]) {
      const d = Math.abs(
        sumTierCourts(ct.hoai, HOAI) - sumTierCourts(ct.huyen, HUYEN),
      )
      if (d > MAX_ABS_TIER_SUM_GAP) {
        throw new Error(`Chênh bậc > ${MAX_ABS_TIER_SUM_GAP} ở ${r.id}`)
      }
    }
  }
}

function verifyNoThreeConsecutiveRounds(rounds) {
  const check = (names, side) => {
    for (const name of names) {
      const plays = rounds.map(
        (r) =>
          r.courtOne[side].includes(name) || r.courtTwo[side].includes(name),
      )
      for (let i = 0; i <= plays.length - 3; i++) {
        if (plays[i] && plays[i + 1] && plays[i + 2]) {
          throw new Error(`${name} (${side}): 3 vòng liên tiếp`)
        }
      }
    }
  }
  check(HOAI, 'hoai')
  check(HUYEN, 'huyen')
}

verifyNoThreeConsecutiveRounds(scheduleRounds)
verifyMatchupTierBands(scheduleRounds)

console.log(JSON.stringify(scheduleRounds, null, 2))
