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
  title: 'Giải đấu Picker Ball — KSTN46',
  subtitle: 'Đối kháng hai đội: Team Hoài và Team Huyền',
  /** Cập nhật khi có lịch cụ thể. */
  date: 'Sắp diễn ra — sẽ cập nhật ngày giờ',
  /** Cập nhật địa điểm khi xác nhận. */
  venue: 'Địa điểm: sẽ thông báo sau',
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
        note: '(k thoát vị)',
      },
      { teamHoai: 'Hoàng NH', teamHuyen: 'Hùng' },
    ],
  },
  {
    id: 'phong-trao',
    label: 'Phong trào',
    rows: [
      { teamHoai: 'Dương', teamHuyen: 'Ngọc' },
      { teamHoai: 'Diễn', teamHuyen: 'Thoa' },
      { teamHoai: 'Hoài', teamHuyen: 'Huyền' },
    ],
  },
]
