import { type ReactNode } from 'react'
import { teamMemberNameClass, type ScheduleCourt } from './data/roster'

/** Tên trong ô nền theo team — dùng lịch thi đấu & admin nhập tỷ số. */
export function TeamNamePill({ team, children }: { team: 'hoai' | 'huyen'; children: ReactNode }) {
  const shell =
    team === 'hoai'
      ? 'rounded-md bg-red-100/95 px-2 py-1 shadow-sm ring-1 ring-red-900/15 dark:bg-red-950/50 dark:ring-red-500/25'
      : 'rounded-md bg-lime-200/90 px-2 py-1 shadow-sm ring-1 ring-lime-700/20 dark:bg-lime-950/55 dark:ring-lime-400/30'
  return (
    <span className={`inline-block max-w-full whitespace-normal ${shell} ${teamMemberNameClass[team]}`}>
      {children}
    </span>
  )
}

/** Một dòng cặp đấu: Team Hoài / Team Huyền + tên VĐV. */
export function ScheduleCourtLine({ court }: { court: ScheduleCourt }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.9375rem] leading-snug text-stone-800 dark:text-stone-200">
      <span className="font-medium text-red-700 dark:text-red-400">Team Hoài:</span>
      <TeamNamePill team="hoai">
        {court.hoai[0]} · {court.hoai[1]}
      </TeamNamePill>
      <span className="inline-flex shrink-0 rounded-md bg-slate-800 px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide text-white shadow-sm dark:bg-blue-950 dark:ring-1 dark:ring-slate-600/70">
        vs
      </span>
      <span className="font-medium text-lime-900 dark:text-lime-300">Team Huyền:</span>
      <TeamNamePill team="huyen">
        {court.huyen[0]} · {court.huyen[1]}
      </TeamNamePill>
      {court.note ? (
        <span className="font-normal text-stone-500 dark:text-stone-500">{` ${court.note}`}</span>
      ) : null}
    </span>
  )
}
