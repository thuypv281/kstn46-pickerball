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
  competitionFormat:
    'Đối kháng đôi hai team. Mỗi VĐV đúng 4 trận trong cả giải. Không lặp cặp đấu (đôi Hoài + đôi Huyền). Mỗi đôi đồng đội cùng phía tối đa 2 trận và không lặp lại hai vòng liền nhau. Lịch sinh thêm ràng buộc: mỗi sân, chênh trung bình «bậc» (thứ tự trong danh sách Hoài vs Huyền) giữa hai đôi đối đầu không quá 1.',
  /** Cập nhật khi có lịch cụ thể. */
  date: '15h15–17h21, ngày 09/05/2026',
  /** Cập nhật địa điểm khi xác nhận. */
  venue: 'Số 202C Phố Nguyễn Sơn, Long Biên',
  /** Google Maps (tọa độ sân / điểm hẹn). */
  venueMapsUrl:
    'https://www.google.com/maps/search/?api=1&query=21.043428087366056,105.88488985360581',
  /** Gợi ý luật thời lượng sân (hiển thị dưới header nếu cần). */
  playCadenceNote: 'Mỗi lượt sân: 15′ thi đấu + 3′ nghỉ; chạm 15.',
}

/** Mốc thời gian thi đấu (GMT+7) — dùng cho đồng hồ đếm ngược; chỉnh khi đổi lịch. */
export const tournamentWindow = {
  startsAt: '2026-05-09T15:15:00+07:00',
  endsAt: '2026-05-09T17:21:00+07:00',
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
 * Hai sân song song — 15h15→17h21: 7 lượt × 18′ (15′ thi đấu + 3′ nghỉ).
 * 7 VĐV Team Hoài × 7 Team Huyền; mỗi lượt 4 người mỗi phía trên hai sân; mỗi VĐV 4 trận.
 * Sinh bằng scripts/generate-schedule.mjs (đầy đủ ràng buộc kỹ thuật ở đầu file; `competitionFormat` chỉ là tóm tắt thể thức).
 */
export const scheduleRounds: ScheduleRound[] = [
  {
    id: 'r1',
    timeSlot: '15h15–15h33',
    courtOne: {
      hoai: ['Thành', 'Thủy Tini'],
      huyen: ['Trung', 'Huyền'],
    },
    courtTwo: {
      hoai: ['HoàngNH', 'Gianh'],
      huyen: ['An', 'Lâm'],
    },
  },
  {
    id: 'r2',
    timeSlot: '15h33–15h51',
    courtOne: {
      hoai: ['Thuỷ', 'Thủy Tini'],
      huyen: ['Lâm', 'Hùng'],
    },
    courtTwo: {
      hoai: ['Vũ', 'Gianh'],
      huyen: ['Tiến', 'Diễn'],
    },
  },
  {
    id: 'r3',
    timeSlot: '15h51–16h09',
    courtOne: {
      hoai: ['Thuỷ', 'Thành'],
      huyen: ['Trung', 'Tiến'],
    },
    courtTwo: {
      hoai: ['Vũ', 'Dương'],
      huyen: ['An', 'Huyền'],
    },
  },
  {
    id: 'r4',
    timeSlot: '16h09–16h27',
    courtOne: {
      hoai: ['Thành', 'Gianh'],
      huyen: ['Trung', 'Hùng'],
    },
    courtTwo: {
      hoai: ['HoàngNH', 'Dương'],
      huyen: ['An', 'Diễn'],
    },
  },
  {
    id: 'r5',
    timeSlot: '16h27–16h45',
    courtOne: {
      hoai: ['Thuỷ', 'Thủy Tini'],
      huyen: ['Tiến', 'Diễn'],
    },
    courtTwo: {
      hoai: ['HoàngNH', 'Gianh'],
      huyen: ['Lâm', 'Hùng'],
    },
  },
  {
    id: 'r6',
    timeSlot: '16h45–17h03',
    courtOne: {
      hoai: ['Thuỷ', 'Dương'],
      huyen: ['Tiến', 'Huyền'],
    },
    courtTwo: {
      hoai: ['Thành', 'Vũ'],
      huyen: ['An', 'Lâm'],
    },
  },
  {
    id: 'r7',
    timeSlot: '17h03–17h21',
    courtOne: {
      hoai: ['HoàngNH', 'Thủy Tini'],
      huyen: ['Trung', 'Diễn'],
    },
    courtTwo: {
      hoai: ['Vũ', 'Dương'],
      huyen: ['Hùng', 'Huyền'],
    },
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

export type TierPairScheduleSlot = {
  roundNumber: number
  timeSlot: string
  courtLabel: string
}

/** Các lượt trong đó `member` thi đấu đôi cho phía `side` (Sân 1 hoặc 2). */
export function scheduleSlotsForTeamMember(
  member: string,
  side: 'hoai' | 'huyen',
  rounds: ScheduleRound[] = scheduleRounds
): TierPairScheduleSlot[] {
  const out: TierPairScheduleSlot[] = []
  rounds.forEach((round, idx) => {
    const roundNumber = idx + 1
    if (side === 'hoai') {
      if (round.courtOne.hoai.includes(member))
        out.push({ roundNumber, timeSlot: round.timeSlot, courtLabel: 'Sân 1' })
      else if (round.courtTwo.hoai.includes(member))
        out.push({ roundNumber, timeSlot: round.timeSlot, courtLabel: 'Sân 2' })
    } else {
      if (round.courtOne.huyen.includes(member))
        out.push({ roundNumber, timeSlot: round.timeSlot, courtLabel: 'Sân 1' })
      else if (round.courtTwo.huyen.includes(member))
        out.push({ roundNumber, timeSlot: round.timeSlot, courtLabel: 'Sân 2' })
    }
  })
  return out
}

export type RosterTeamTableRow = {
  key: string
  member: string
  roundSlots: TierPairScheduleSlot[]
}

/** Các hàng của một đội theo thứ tự hạng trong `sections`. */
export function buildRosterRowsForTeam(
  sections: RosterSection[],
  side: 'hoai' | 'huyen'
): RosterTeamTableRow[] {
  const out: RosterTeamTableRow[] = []
  for (const section of sections) {
    for (const row of section.rows) {
      const name = side === 'hoai' ? row.teamHoai : row.teamHuyen
      out.push({
        key: `${section.id}-${name}-${side}`,
        member: name,
        roundSlots: scheduleSlotsForTeamMember(name, side),
      })
    }
  }
  return out
}

export const rosterSections: RosterSection[] = [
  {
    id: 'thanhvien',
    label: 'Thành viên',
    rows: [
      { teamHoai: 'Thuỷ', teamHuyen: 'Trung' },
      { teamHoai: 'Thành', teamHuyen: 'An' },
      { teamHoai: 'HoàngNH', teamHuyen: 'Tiến' },
      { teamHoai: 'Vũ', teamHuyen: 'Lâm' },
      { teamHoai: 'Gianh', teamHuyen: 'Hùng' },
      { teamHoai: 'Thủy Tini', teamHuyen: 'Diễn' },
      { teamHoai: 'Dương', teamHuyen: 'Huyền' },
    ],
  },
]
