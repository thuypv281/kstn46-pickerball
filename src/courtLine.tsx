import { type ReactNode } from 'react'
import { teamMemberNameClass, teamLabels, type ScheduleCourt } from './data/roster'

/** Tên trong ô nền theo team — dùng lịch thi đấu & admin nhập tỷ số. */
export function TeamNamePill({ team, children }: { team: 'hoai' | 'huyen'; children: ReactNode }) {
  const shell =
    team === 'hoai'
      ? 'rounded-md bg-itg-red-soft px-2 py-1 shadow-sm ring-1 ring-itg-red/20'
      : 'rounded-md bg-itg-green-muted/80 px-2 py-1 shadow-sm ring-1 ring-itg-green/25'
  return (
    <span className={`inline-block max-w-full whitespace-normal ${shell} ${teamMemberNameClass[team]}`}>
      {children}
    </span>
  )
}

/** Một dòng cặp đấu: Đội A / Đội B + tên VĐV. */
export function ScheduleCourtLine({ court }: { court: ScheduleCourt }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.9375rem] leading-snug text-stone-800 dark:text-stone-200">
      <span className="font-medium text-itg-red-dark dark:text-itg-red">{teamLabels.hoai}:</span>
      <TeamNamePill team="hoai">
        {court.hoai[0]} · {court.hoai[1]}
      </TeamNamePill>
      <span className="inline-flex shrink-0 rounded-md bg-itg-red-dark px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide text-white shadow-sm">
        vs
      </span>
      <span className="font-medium text-itg-green-dark dark:text-itg-green">{teamLabels.huyen}:</span>
      <TeamNamePill team="huyen">
        {court.huyen[0]} · {court.huyen[1]}
      </TeamNamePill>
      {court.note ? (
        <span className="font-normal text-stone-500 dark:text-stone-500">{` ${court.note}`}</span>
      ) : null}
    </span>
  )
}
