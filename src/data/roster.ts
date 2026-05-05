export type RosterRow = {
  teamHoai: string
  teamHuyen: string
  /** Shown as secondary text for the pairing (e.g. status note). */
  note?: string
}

export type RosterSection = {
  id: string
  label: string
  rows: RosterRow[]
}

export const tournamentMeta = {
  title: 'Giải đấu Picker Ball — KSTN K46',
  /** Tiêu đề tab + khối thông tin (thay nhãn “Thông tin giải đấu”). */
  infoHeading: 'Giải đấu Picker Ball — KSTN K46 25 năm ra trường 2006-2026',
  subtitle: 'Đối kháng thi đấu đôi: Team Hoài vs Team Huyền',
  competitionFormat: 'Đối kháng đôi giữa 2 team',
  /** Cập nhật khi có lịch cụ thể. */
  date: '15h15–18h15, ngày 09/05/2026',
  /** Cập nhật địa điểm khi xác nhận. */
  venue: 'Số 202C Phố Nguyễn Sơn, Long Biên',
  /** Google Maps (tọa độ sân / điểm hẹn). */
  venueMapsUrl:
    'https://www.google.com/maps/search/?api=1&query=21.043428087366056,105.88488985360581',
  /** Gợi ý luật thời lượng sân (hiển thị dưới header nếu cần). */
  playCadenceNote: 'Mỗi lượt sân: ~15′ thi đấu + ~3′ nghỉ; chạm 15.',
}

/** Mốc thời gian thi đấu (GMT+7) — dùng cho đồng hồ đếm ngược; chỉnh khi đổi lịch. */
export const tournamentWindow = {
  startsAt: '2026-05-09T15:15:00+07:00',
  endsAt: '2026-05-09T18:15:00+07:00',
} as const

/** Một trận đôi: cặp Team Hoài × cặp Team Huyền. */
export type ScheduleCourt = {
  hoai: [string, string]
  huyen: [string, string]
  /** Ghi chú sau dòng (vd. trạng thái VĐV). */
  note?: string
}

export type ScheduleRound = {
  id: string
  timeSlot: string
  courtOne: ScheduleCourt
  courtTwo: ScheduleCourt
  /** Trận đôi sân 1: gộp ô với tỷ số; không ghi → «chưa diễn ra». */
  scoreCourtOne?: string
  /** Trận đôi sân 2. */
  scoreCourtTwo?: string
}

/** Màu chữ tên VĐV — Team Hoài đỏ / Team Huyền lime. */
export const teamMemberNameClass = {
  hoai: 'font-semibold text-red-700 dark:text-red-400',
  huyen: 'font-semibold text-lime-900 dark:text-lime-200',
} as const

export const teamRosterHeadingClass = {
  hoai: 'font-semibold text-red-700 dark:text-red-400',
  huyen: 'font-semibold text-lime-900 dark:text-lime-300',
} as const

export const teamRosterTableFrameClass = {
  hoai: 'border-red-700/35 dark:border-red-600/35',
  huyen: 'border-lime-600/38 dark:border-lime-400/35',
} as const

/**
 * Hai sân song song — 15h15→18h15 (180′): 10 lượt × 18′.
 * Nhóm A (lé): Thuỷ, Gianh, Thành, Vũ × đối thủ Trung, An, Tiến, Lâm — nhóm B (chẵn): Hoàng Baby, Dương, Diễn, Hoài × Hùng, Thủy Tini, Thoa, Huyền.
 * Lẻ: hai sân cùng nhóm A; chẵn: hai sân cùng nhóm B.
 * Mỗi cặp đồng đội (cùng sân, trong nhóm 4) đánh cùng nhau tối đa 2 lần.
 * Không có cặp đấu (đôi Hoài × đôi Huyền) lặp lại giữa các lượt.
 */
export const scheduleRounds: ScheduleRound[] = [
  {
    id: 'r1',
    timeSlot: '15h15–15h33',
    courtOne: { hoai: ['Thuỷ', 'Gianh'], huyen: ['Trung', 'An'] },
    courtTwo: { hoai: ['Thành', 'Vũ'], huyen: ['Tiến', 'Lâm'] },
  },
  {
    id: 'r2',
    timeSlot: '15h33–15h51',
    courtOne: { hoai: ['Hoàng Baby', 'Dương'], huyen: ['Hùng', 'Thủy Tini'] },
    courtTwo: { hoai: ['Diễn', 'Hoài'], huyen: ['Thoa', 'Huyền'] },
  },
  {
    id: 'r3',
    timeSlot: '15h51–16h09',
    courtOne: { hoai: ['Thuỷ', 'Thành'], huyen: ['Trung', 'Tiến'] },
    courtTwo: { hoai: ['Gianh', 'Vũ'], huyen: ['An', 'Lâm'] },
  },
  {
    id: 'r4',
    timeSlot: '16h09–16h27',
    courtOne: { hoai: ['Hoàng Baby', 'Diễn'], huyen: ['Hùng', 'Thoa'] },
    courtTwo: { hoai: ['Dương', 'Hoài'], huyen: ['Thủy Tini', 'Huyền'] },
  },
  {
    id: 'r5',
    timeSlot: '16h27–16h45',
    courtOne: { hoai: ['Thuỷ', 'Vũ'], huyen: ['Trung', 'Lâm'] },
    courtTwo: { hoai: ['Gianh', 'Thành'], huyen: ['An', 'Tiến'] },
  },
  {
    id: 'r6',
    timeSlot: '16h45–17h03',
    courtOne: { hoai: ['Hoàng Baby', 'Hoài'], huyen: ['Hùng', 'Huyền'] },
    courtTwo: { hoai: ['Dương', 'Diễn'], huyen: ['Thủy Tini', 'Thoa'] },
  },
  {
    id: 'r7',
    timeSlot: '17h03–17h21',
    courtOne: { hoai: ['Thuỷ', 'Gianh'], huyen: ['Trung', 'Tiến'] },
    courtTwo: { hoai: ['Thuỷ', 'Thành'], huyen: ['Trung', 'An'] },
  },
  {
    id: 'r8',
    timeSlot: '17h21–17h39',
    courtOne: { hoai: ['Hoàng Baby', 'Dương'], huyen: ['Thủy Tini', 'Thoa'] },
    courtTwo: { hoai: ['Dương', 'Hoài'], huyen: ['Thoa', 'Huyền'] },
  },
  {
    id: 'r9',
    timeSlot: '17h39–17h57',
    courtOne: { hoai: ['Thuỷ', 'Vũ'], huyen: ['An', 'Tiến'] },
    courtTwo: { hoai: ['Gianh', 'Thành'], huyen: ['Tiến', 'Lâm'] },
  },
  {
    id: 'r10',
    timeSlot: '17h57–18h15',
    courtOne: { hoai: ['Hoàng Baby', 'Hoài'], huyen: ['Thủy Tini', 'Huyền'] },
    courtTwo: { hoai: ['Dương', 'Diễn'], huyen: ['Hùng', 'Thoa'] },
  },
]

export type TeamStandingRow = {
  rank: number
  name: string
  played: number
  won: number
  lost: number
  points: number
  /** Tổng điểm đội ghi trong các trận thắng. */
  pointsInWins: number
  /** Tổng điểm đội ghi trong các trận thua. */
  pointsInLosses: number
  /** Hiệu số: tổng điểm ghi − điểm đối thủ (mọi trận). */
  pointDiff: number
}

export const teamStandings: TeamStandingRow[] = [
  {
    rank: 1,
    name: 'Team Hoài',
    played: 0,
    won: 0,
    lost: 0,
    points: 0,
    pointsInWins: 0,
    pointsInLosses: 0,
    pointDiff: 0,
  },
  {
    rank: 2,
    name: 'Team Huyền',
    played: 0,
    won: 0,
    lost: 0,
    points: 0,
    pointsInWins: 0,
    pointsInLosses: 0,
    pointDiff: 0,
  },
]

function courtFacesTierPair(court: ScheduleCourt, teamHoai: string, teamHuyen: string): boolean {
  return court.hoai.includes(teamHoai) && court.huyen.includes(teamHuyen)
}

export type TierPairScheduleSlot = {
  roundNumber: number
  timeSlot: string
  courtLabel: string
}

/** Các lượt mà hai VĐV đồng hạng (Hoài × Huyền) cùng nằm trong một trận đôi (hai bên sân). */
export function scheduleSlotsForTierPair(
  teamHoai: string,
  teamHuyen: string,
  rounds: ScheduleRound[] = scheduleRounds
): TierPairScheduleSlot[] {
  const out: TierPairScheduleSlot[] = []
  rounds.forEach((round, idx) => {
    const roundNumber = idx + 1
    if (courtFacesTierPair(round.courtOne, teamHoai, teamHuyen)) {
      out.push({ roundNumber, timeSlot: round.timeSlot, courtLabel: 'Sân 1' })
    }
    if (courtFacesTierPair(round.courtTwo, teamHoai, teamHuyen)) {
      out.push({ roundNumber, timeSlot: round.timeSlot, courtLabel: 'Sân 2' })
    }
  })
  return out
}

export type RosterTeamTableRow = {
  key: string
  tierLabel: string
  member: string
  opponent: string
  tierPairSlots: TierPairScheduleSlot[]
}

/** Các hàng của một đội theo thứ tự hạng trong `sections`. */
export function buildRosterRowsForTeam(
  sections: RosterSection[],
  side: 'hoai' | 'huyen'
): RosterTeamTableRow[] {
  const out: RosterTeamTableRow[] = []
  for (const section of sections) {
    for (const row of section.rows) {
      out.push({
        key: `${section.id}-${row.teamHoai}-${row.teamHuyen}-${side}`,
        tierLabel: section.label,
        member: side === 'hoai' ? row.teamHoai : row.teamHuyen,
        opponent: side === 'hoai' ? row.teamHuyen : row.teamHoai,
        tierPairSlots: scheduleSlotsForTierPair(row.teamHoai, row.teamHuyen),
      })
    }
  }
  return out
}

export const rosterSections: RosterSection[] = [
  {
    id: 'chu-luc',
    label: 'Chủ lực',
    rows: [
      { teamHoai: 'Thuỷ', teamHuyen: 'Trung' },
      { teamHoai: 'Gianh', teamHuyen: 'An' },
      { teamHoai: 'Thành', teamHuyen: 'Tiến' },
      {
        teamHoai: 'Vũ',
        teamHuyen: 'Lâm',
      },
      { teamHoai: 'Hoàng Baby', teamHuyen: 'Hùng' },
    ],
  },
  {
    id: 'phong-trao',
    label: 'Phong trào',
    rows: [
      { teamHoai: 'Dương', teamHuyen: 'Thủy Tini' },
      { teamHoai: 'Diễn', teamHuyen: 'Thoa' },
      { teamHoai: 'Hoài', teamHuyen: 'Huyền' },
    ],
  },
]
