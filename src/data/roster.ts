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

export const teamLabels = {
  hoai: 'Đội A',
  huyen: 'Đội B',
} as const

const teamANameKeys = new Set([
  'đội a',
  'team hoài',
  'team hoai',
  'team a',
])

const teamBNameKeys = new Set([
  'đội b',
  'team huyền',
  'team huyen',
  'team b',
])

/** Nhận diện phía đội từ tên hiển thị (kể cả tên cũ Team Hoài / Team Huyền). */
export function teamSideFromName(name: string): 'hoai' | 'huyen' | null {
  const key = name.trim().toLowerCase()
  if (teamANameKeys.has(key)) return 'hoai'
  if (teamBNameKeys.has(key)) return 'huyen'
  return null
}

export const tournamentMeta = {
  title: 'ITG Pickerball Tournament',
  /** Tiêu đề tab + khối thông tin (thay nhãn “Thông tin giải đấu”). */
  infoHeading: 'ITG Pickerball Tournament',
  subtitle: 'Đối kháng chéo: Đội A vs Đội B',
  competitionFormat:
    'Đối kháng chéo 6 lượt · 2 sân · 12 VĐV (6 vs 6), cân bằng trình độ. Mỗi người đánh đúng 4 séc; đổi bạn cặp liên tục, không trùng cặp cũ. Sân 1 — Tâm Điểm; Sân 2 — Vừa Sức. Thành viên nghỉ chủ động làm trọng tài, bấm giờ và hỗ trợ nhặt bóng cho cả hai sân.',
  /** Cập nhật khi có lịch cụ thể. */
  date: '15h30, ngày 23/05/2026',
  /** Gợi ý luật thời lượng sân (hiển thị dưới header nếu cần). */
  playCadenceNote: 'Mỗi lượt sân: 15–18′/séc (đến 11 điểm); 2–3′ xoay vòng giữa các lượt.',
  courtOneLabel: 'Sân 1 — Tâm Điểm',
  courtTwoLabel: 'Sân 2 — Vừa Sức',
}

/** Mốc thời gian thi đấu (GMT+7) — dùng cho đồng hồ đếm ngược. */
export const tournamentWindow = {
  startsAt: '2026-05-23T15:30:00+07:00',
  endsAt: '2026-05-23T17:30:00+07:00',
} as const

/** Một trận đôi: cặp Đội A × cặp Đội B (`hoai` / `huyen` giữ key nội bộ). */
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

/** Màu chữ tên VĐV — Đội A đỏ / Đội B xanh ITG. */
export const teamMemberNameClass = {
  hoai: 'font-semibold text-itg-red-dark',
  huyen: 'font-semibold text-itg-green-dark',
} as const

export const teamRosterHeadingClass = {
  hoai: 'font-semibold text-itg-red-dark',
  huyen: 'font-semibold text-itg-green-dark',
} as const

export const teamRosterTableFrameClass = {
  hoai: 'border-itg-red/30',
  huyen: 'border-itg-green/35',
} as const

/**
 * Lịch ITG — 6 lượt × 2 sân (15h30→17h30), mỗi lượt 20′.
 * Nguồn: Lich_Thi_Dau_Pickleball_ITG.pdf — đối kháng chéo Đội A vs Đội B.
 */
export const scheduleRounds: ScheduleRound[] = [
  {
    id: 'r1',
    timeSlot: '15h30–15h50',
    courtOne: {
      hoai: ['Hường', 'Lượng'],
      huyen: ['Trí', 'Dự'],
      note: 'Trung bình khá mở màn',
    },
    courtTwo: {
      hoai: ['Phương', 'Cường'],
      huyen: ['Ngọ', 'Dũng'],
      note: 'Kèo siêu Newbie',
    },
  },
  {
    id: 'r2',
    timeSlot: '15h50–16h10',
    courtOne: {
      hoai: ['Hòa', 'Cường'],
      huyen: ['Ngọc', 'Dũng'],
      note: 'ĐT gánh siêu Newbie',
    },
    courtTwo: {
      hoai: ['Lượng', 'Phương'],
      huyen: ['Dự', 'Ngọ'],
      note: 'Newbie đại chiến',
    },
  },
  {
    id: 'r3',
    timeSlot: '16h10–16h30',
    courtOne: {
      hoai: ['Hoài', 'Hường'],
      huyen: ['Hoàng', 'Trí'],
      note: 'Kinh nghiệm so tài',
    },
    courtTwo: {
      hoai: ['Hòa', 'Phương'],
      huyen: ['Ngọc', 'Ngọ'],
      note: 'ĐT gánh Newbie trận 1',
    },
  },
  {
    id: 'r4',
    timeSlot: '16h30–16h50',
    courtOne: {
      hoai: ['Hòa', 'Hường'],
      huyen: ['Ngọc', 'Trí'],
      note: 'Nảy lửa trước chung kết',
    },
    courtTwo: {
      hoai: ['Hoài', 'Cường'],
      huyen: ['Hoàng', 'Dũng'],
      note: 'Kèo gánh Newbie hiệp 2',
    },
  },
  {
    id: 'r5',
    timeSlot: '16h50–17h10',
    courtOne: {
      hoai: ['Hoài', 'Lượng'],
      huyen: ['Hoàng', 'Dự'],
      note: 'Cân bằng mid-game',
    },
    courtTwo: {
      hoai: ['Hường', 'Phương'],
      huyen: ['Trí', 'Ngọ'],
      note: 'Kinh nghiệm + Newbie',
    },
  },
  {
    id: 'r6',
    timeSlot: '17h10–17h30',
    courtOne: {
      hoai: ['Hòa', 'Hoài'],
      huyen: ['Ngọc', 'Hoàng'],
      note: 'Trận chung kết đỉnh cao',
    },
    courtTwo: {
      hoai: ['Lượng', 'Cường'],
      huyen: ['Dự', 'Dũng'],
      note: 'Newbie chốt hạ giải',
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

/** Chuẩn hóa tên đội trên bảng xếp hạng → Đội A / Đội B. */
export function normalizeTeamStandings(rows: TeamStandingRow[]): TeamStandingRow[] {
  return rows.map((row) => {
    const side = teamSideFromName(row.name)
    if (side === 'hoai') return { ...row, name: teamLabels.hoai }
    if (side === 'huyen') return { ...row, name: teamLabels.huyen }
    return row
  })
}

export const teamStandings: TeamStandingRow[] = [
  {
    rank: 1,
    name: teamLabels.hoai,
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
    name: teamLabels.huyen,
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
        out.push({
          roundNumber,
          timeSlot: round.timeSlot,
          courtLabel: tournamentMeta.courtOneLabel,
        })
      else if (round.courtTwo.hoai.includes(member))
        out.push({
          roundNumber,
          timeSlot: round.timeSlot,
          courtLabel: tournamentMeta.courtTwoLabel,
        })
    } else {
      if (round.courtOne.huyen.includes(member))
        out.push({
          roundNumber,
          timeSlot: round.timeSlot,
          courtLabel: tournamentMeta.courtOneLabel,
        })
      else if (round.courtTwo.huyen.includes(member))
        out.push({
          roundNumber,
          timeSlot: round.timeSlot,
          courtLabel: tournamentMeta.courtTwoLabel,
        })
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
      { teamHoai: 'Hòa', teamHuyen: 'Ngọc', note: 'Phùng Đức Hòa · Đinh Thanh Ngọc — ĐT' },
      { teamHoai: 'Hoài', teamHuyen: 'Hoàng', note: 'Hồ Thị Hoài · Nguyễn Hữu Hoàng' },
      { teamHoai: 'Hường', teamHuyen: 'Trí', note: 'Bùi Bích Hường · Phạm Xuân Trí' },
      { teamHoai: 'Lượng', teamHuyen: 'Dự', note: 'Lê Văn Lượng · Nguyễn Huy Dự' },
      { teamHoai: 'Phương', teamHuyen: 'Ngọ', note: 'Đào Đức Phương · Lê Duy Ngọ' },
      { teamHoai: 'Cường', teamHuyen: 'Dũng', note: 'Vũ Văn Cường · Nguyễn Văn Dũng' },
    ],
  },
]
