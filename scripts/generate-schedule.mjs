/**
 * Giải 7 vòng × 2 sân — 7 Hoài × 7 Huyền, mỗi VĐV đúng 4 trận.
 *
 * (1) Không lặp cùng một cặp đấu (đôi Hoài + đôi Huyền).
 * (2) Mỗi đôi đồng đội (hai người một bên) tối đa 2 trận trong cả giải.
 * (3) Cùng một đôi đồng đội (cùng phía) không xuất hiện hai vòng liên tiếp.
 * (4) Không VĐV nào đánh ba vòng liên tiếp trên một phía (Hoài và Huyền riêng).
 *
 * Lưu: Cấm «một VĐV không được đánh hai vòng liên tiếp» thì không tương thích
 * đồng thời với đủ 4 người/phía và mọi người 4 trận trong 7 vòng — xem roster.ts.
 *
 * Sinh: node scripts/generate-schedule.mjs
 */
const HOAI = ['Thuỷ', 'Gianh', 'Thành', 'Vũ', 'Hoàng Baby', 'Dương', 'Thùy Tini']
const HUYEN = ['Trung', 'An', 'Tiến', 'Lâm', 'Hùng', 'Diễn', 'Huyền']

const PLAYERS_SIDE = 7
const NUM_ROUNDS = 7
const GAMES_PER_PLAYER = 4
const MAX_PAIR_GAMES = 2

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
  const endMin = 18 * 60 + 15
  const step = (endMin - startMin) / NUM_ROUNDS
  const fmt = (m) => {
    const h = Math.floor(m / 60)
    const mm = Math.round(m % 60)
    return `${h}h${String(mm).padStart(2, '0')}`
  }
  const out = []
  for (let i = 0; i < NUM_ROUNDS; i++) {
    const a = startMin + i * step
    const b = startMin + (i + 1) * step
    out.push(`${fmt(a)}–${fmt(b)}`)
  }
  return out
}

let foundPath = null
for (let seed = 1; seed < 12_000_000 && !foundPath; seed++) {
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

console.log(JSON.stringify(scheduleRounds, null, 2))
