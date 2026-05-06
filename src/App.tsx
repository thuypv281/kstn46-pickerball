import { useEffect, useId, useMemo, useState } from 'react'
import { fetchTournamentState, type TournamentApiState } from './api/tournament'
import { ScheduleCourtLine } from './courtLine'
import {
  rosterSections,
  buildRosterRowsForTeam,
  scheduleRounds,
  teamMemberNameClass,
  teamRosterHeadingClass,
  teamRosterTableFrameClass,
  teamStandings,
  tournamentMeta,
  tournamentWindow,
  type RosterTeamTableRow,
  type ScheduleCourt,
  type ScheduleRound,
  type TierPairScheduleSlot,
  type TeamStandingRow,
} from './data/roster'

type MainTab = 'info' | 'schedule' | 'standings'

function formatRemainingParts(msPositive: number) {
  const totalSec = Math.floor(msPositive / 1000)
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  }
}

function MatchCountdown() {
  const headingId = useId()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const startMs = Date.parse(tournamentWindow.startsAt)
  const endMs = Date.parse(tournamentWindow.endsAt)
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return null

  if (now >= endMs) {
    return (
      <div className="mt-2 text-center sm:text-left" role="status">
        <p className="text-xs font-medium text-stone-600 dark:text-stone-400">
          Khung giờ thi đấu đã kết thúc.
        </p>
      </div>
    )
  }

  if (now >= startMs) {
    return (
      <div className="mt-2 text-center sm:text-left" role="status">
        <p className="text-xs font-semibold text-lime-900 dark:text-lime-300">
          Đang trong khung giờ thi đấu.
        </p>
      </div>
    )
  }

  const { days, hours, minutes, seconds } = formatRemainingParts(startMs - now)
  const two = (n: number) => String(n).padStart(2, '0')
  const ariaLabel = `Còn ${days} ngày, ${hours} giờ, ${minutes} phút, ${seconds} giây đến giờ thi đấu`

  const blocks: { display: string; label: string }[] = [
    { display: String(days), label: 'Ngày' },
    { display: two(hours), label: 'Giờ' },
    { display: two(minutes), label: 'Phút' },
    { display: two(seconds), label: 'Giây' },
  ]

  return (
    <div
      className="mt-2 flex flex-wrap items-center justify-start gap-x-3 gap-y-1"
      aria-labelledby={headingId}
      aria-label={ariaLabel}
    >
      <span
        id={headingId}
        className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-red-700 dark:text-red-400"
      >
        Đếm ngược
      </span>
      <div className="flex items-center gap-3 tabular-nums">
        {blocks.map(({ display, label }) => (
          <div key={label} className="text-center">
            <p className="text-base font-bold leading-none text-stone-900 dark:text-stone-50 sm:text-lg">
              {display}
            </p>
            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Một ô sân: lịch cặp + tỷ số trong cùng cột */
function ScheduleCourtCell({ court, score }: { court: ScheduleCourt; score?: string }) {
  const v = score?.trim()
  return (
    <div className="space-y-1.5">
      <ScheduleCourtLine court={court} />
      <p className="text-[0.8125rem] leading-snug text-stone-600 dark:text-stone-400">
        <span className="font-medium text-stone-700 dark:text-stone-300">Tỷ số:</span>{' '}
        {v?.length ? (
          <span className="tabular-nums font-medium text-stone-800 dark:text-stone-100">{v}</span>
        ) : (
          <span className="text-stone-500 dark:text-stone-500">chưa diễn ra</span>
        )}
      </p>
    </div>
  )
}

function RosterTierScheduleCell({ slots }: { slots: TierPairScheduleSlot[] }) {
  if (slots.length === 0) {
    return <span className="text-stone-400 dark:text-stone-600">—</span>
  }
  return (
    <ul className="list-none space-y-1.5 text-left text-[0.8125rem] leading-snug text-stone-600 dark:text-stone-400">
      {slots.map((s) => (
        <li key={`${s.roundNumber}-${s.timeSlot}-${s.courtLabel}`}>
          <span className="font-semibold text-stone-800 dark:text-stone-200">
            Vòng {s.roundNumber}
          </span>
          {' · '}
          <span className="tabular-nums">{s.timeSlot}</span>
          {' · '}
          <span className="text-stone-500 dark:text-stone-500">{s.courtLabel}</span>
        </li>
      ))}
    </ul>
  )
}

function TeamRosterTable({
  title,
  rows,
  headingId,
  headerClass,
  side,
}: {
  title: string
  rows: RosterTeamTableRow[]
  headingId: string
  headerClass: string
  side: 'hoai' | 'huyen'
}) {
  const frameClass = teamRosterTableFrameClass[side]

  return (
    <div className="space-y-3">
      <h3
        id={headingId}
        className={`text-center text-lg font-semibold tracking-tight sm:text-left sm:text-xl ${teamRosterHeadingClass[side]}`}
      >
        {title}
      </h3>
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
        <div
          className={`inline-block min-w-full rounded-2xl border bg-slate-50/96 align-middle shadow-md shadow-slate-400/28 dark:bg-slate-900/92 dark:shadow-black/45 ${frameClass}`}
        >
          <table className="min-w-[20rem] w-full border-collapse text-left">
            <thead>
              <tr className={headerClass}>
                <th scope="col" className="px-4 py-3 text-sm font-semibold sm:px-5 sm:py-4">
                  Thành viên
                </th>
                <th scope="col" className="min-w-[12rem] px-4 py-3 text-sm font-semibold sm:min-w-[16rem] sm:px-5 sm:py-4">
                  Các vòng thi đấu
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.key}
                  className={[
                    'border-t border-slate-300/70 dark:border-slate-700/55',
                    index % 2 === 1 ? 'bg-slate-100/75 dark:bg-slate-800/50' : 'bg-transparent',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <td className="px-4 py-3 sm:px-5 sm:py-4">
                    <span className={teamMemberNameClass[side]}>{row.member}</span>
                  </td>
                  <td className="max-w-[16rem] px-4 py-3 sm:max-w-none sm:px-5 sm:py-4">
                    <RosterTierScheduleCell slots={row.roundSlots} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function VenueMapLink({ className }: { className?: string }) {
  return (
    <a
      href={tournamentMeta.venueMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-inherit underline decoration-slate-400/85 underline-offset-[3px] transition hover:text-blue-700 hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700/50 focus-visible:ring-offset-2 dark:decoration-slate-500 dark:hover:text-sky-400 dark:focus-visible:ring-offset-blue-950 ${className ?? ''}`.trim()}
      aria-label={`Mở Google Maps: ${tournamentMeta.venue}`}
    >
      {tournamentMeta.venue}
    </a>
  )
}

function TournamentDetailsSection() {
  const { competitionFormat, date, playCadenceNote } = tournamentMeta
  const playCadenceBody = playCadenceNote.replace(/^Mỗi lượt sân:\s*/i, '').trim()

  return (
    <section
      className="mx-auto w-full max-w-4xl px-4 pb-4 pt-8 sm:px-6 sm:pb-6 sm:pt-10"
      aria-labelledby="heading-tournament-details"
    >
      <h2
        id="heading-tournament-details"
        className="mx-auto mb-6 max-w-3xl text-balance text-center text-lg font-semibold tracking-tight text-stone-900 sm:text-xl md:text-2xl dark:text-stone-50"
      >
        {tournamentMeta.infoHeading}
      </h2>
      <div className="rounded-2xl border border-slate-300/85 bg-slate-50/92 p-5 shadow-md shadow-slate-400/25 dark:border-slate-700/55 dark:bg-slate-900/88 dark:shadow-black/40 sm:p-6">
        <dl className="space-y-4 text-left text-sm leading-relaxed text-stone-600 sm:text-base dark:text-stone-400">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="m-0 shrink-0 font-semibold text-stone-800 dark:text-stone-100">Thể thức thi đấu:</dt>
            <dd className="m-0 min-w-0">{competitionFormat}</dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="m-0 shrink-0 font-semibold text-stone-800 dark:text-stone-100">Thời gian:</dt>
            <dd className="m-0 min-w-0">{date}</dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="m-0 shrink-0 font-semibold text-stone-800 dark:text-stone-100">Địa điểm:</dt>
            <dd className="m-0 min-w-0">
              <VenueMapLink />
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="m-0 shrink-0 font-semibold text-stone-800 dark:text-stone-100">Mỗi lượt sân:</dt>
            <dd className="m-0 min-w-0">{playCadenceBody}</dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2 border-t border-slate-200/80 pt-4 dark:border-slate-600/55">
            <dt className="m-0 shrink-0 font-semibold text-stone-800 dark:text-stone-100">Lịch từng thành viên:</dt>
            <dd className="m-0 min-w-0">
              Bảng dưới mỗi team liệt kê <strong>các vòng</strong> mà người đó <strong>có ra sân</strong> trong lịch lưới (Sân 1 hoặc
              Sân 2), khớp với tab Lịch thi đấu.
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

function TeamRosterSection() {
  const hoaiRows = buildRosterRowsForTeam(rosterSections, 'hoai')
  const huyenRows = buildRosterRowsForTeam(rosterSections, 'huyen')
  const baseId = useId()

  return (
    <section
      className="mx-auto w-full max-w-4xl px-4 pb-10 pt-4 sm:px-6 sm:pt-6"
      aria-labelledby="heading-roster-teams"
    >
      <h2
        id="heading-roster-teams"
        className="mb-8 text-center text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl dark:text-stone-50"
      >
        Đội hình hai team
      </h2>

      <div className="flex flex-col gap-10">
        <TeamRosterTable
          title="Team Hoài"
          rows={hoaiRows}
          headingId={`${baseId}-hoai`}
          headerClass="bg-red-800 text-red-50 dark:bg-red-950 dark:text-red-100"
          side="hoai"
        />
        <TeamRosterTable
          title="Team Huyền"
          rows={huyenRows}
          headingId={`${baseId}-huyen`}
          headerClass="bg-lime-600 text-lime-950 dark:bg-lime-800 dark:text-lime-50"
          side="huyen"
        />
      </div>
    </section>
  )
}

function ScheduleRoundCard({ round, roundNumber }: { round: ScheduleRound; roundNumber: number }) {
  return (
    <article
      className="rounded-xl border border-slate-300/85 bg-slate-50/92 p-4 shadow-md shadow-slate-400/25 dark:border-slate-700/55 dark:bg-slate-900/88 dark:shadow-black/40 sm:hidden"
      aria-label={`Vòng ${roundNumber}, khung giờ ${round.timeSlot}`}
    >
      <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
        <span className="text-red-700 dark:text-red-400">Vòng {roundNumber}</span>
        {' · '}
        <span className="tabular-nums font-medium text-stone-700 dark:text-stone-300">
          {round.timeSlot}
        </span>
      </p>
      <div className="mt-3 space-y-4 text-sm">
        <div className="space-y-2">
          <p className="font-medium text-stone-600 dark:text-stone-400">Sân 1</p>
          <ScheduleCourtCell court={round.courtOne} score={round.scoreCourtOne} />
        </div>
        <div className="space-y-2 border-t border-slate-200/90 pt-4 dark:border-slate-600/55">
          <p className="font-medium text-stone-600 dark:text-stone-400">Sân 2</p>
          <ScheduleCourtCell court={round.courtTwo} score={round.scoreCourtTwo} />
        </div>
      </div>
    </article>
  )
}

function ScheduleBlock({ rounds }: { rounds: ScheduleRound[] }) {
  return (
    <section
      className="mx-auto w-full max-w-4xl px-4 pt-3 sm:px-6 sm:pt-4"
      aria-labelledby="heading-schedule-grid"
    >
      <h2
        id="heading-schedule-grid"
        className="mb-10 text-center text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl dark:text-stone-50"
      >
        Lịch sân &amp; khung giờ
      </h2>

      <div className="mb-10 hidden overflow-hidden rounded-2xl border border-slate-300/85 bg-slate-50/95 shadow-md shadow-slate-400/28 dark:border-slate-700/50 dark:bg-slate-900/93 dark:shadow-black/45 sm:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-700 text-white dark:bg-blue-900/92 dark:text-slate-100">
              <th scope="col" className="whitespace-nowrap px-5 py-4 text-sm font-semibold">
                Vòng
              </th>
              <th scope="col" className="whitespace-nowrap px-5 py-4 text-sm font-semibold">
                Khung giờ
              </th>
              <th scope="col" className="px-5 py-4 text-sm font-semibold">
                Sân 1
              </th>
              <th scope="col" className="px-5 py-4 text-sm font-semibold">
                Sân 2
              </th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((round, ri) => (
              <tr
                key={round.id}
                className="border-t border-slate-300/65 odd:bg-slate-200/45 dark:border-slate-700/50 dark:odd:bg-slate-800/55"
              >
                <td className="whitespace-nowrap px-5 py-4 font-semibold text-red-700 tabular-nums dark:text-red-400">
                  Vòng {ri + 1}
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-semibold text-stone-900 dark:text-stone-100">
                  {round.timeSlot}
                </td>
                <td className="px-5 py-4 align-top">
                  <ScheduleCourtCell court={round.courtOne} score={round.scoreCourtOne} />
                </td>
                <td className="px-5 py-4 align-top">
                  <ScheduleCourtCell court={round.courtTwo} score={round.scoreCourtTwo} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-10 flex flex-col gap-4 sm:hidden">
        {rounds.map((round, ri) => (
          <ScheduleRoundCard key={round.id} round={round} roundNumber={ri + 1} />
        ))}
      </div>
    </section>
  )
}

function StandingsBlock({ rows }: { rows: TeamStandingRow[] }) {
  return (
    <section
      className="mx-auto w-full max-w-4xl px-4 pb-10 pt-3 sm:px-6 sm:pt-4"
      aria-labelledby="heading-standings"
    >
      <h2
        id="heading-standings"
        className="mb-10 text-center text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl dark:text-stone-50"
      >
        Bảng xếp hạng hai đội
      </h2>

      <StandingsTables rows={rows} />
    </section>
  )
}

/** Huân chương-style icon theo thứ hạng — vàng / bạc / trung lập. */
function StandingRankMedalIcon({
  rank,
  compact,
}: {
  rank: number
  compact?: boolean
}) {
  const size = compact ? 'h-7 w-7 shrink-0' : 'h-8 w-8 shrink-0'
  const tint =
    rank === 1
      ? 'text-amber-600 shadow-[0_2px_8px_-2px_rgb(217_119_6/0.45)] dark:text-amber-400 dark:shadow-[0_2px_10px_-2px_rgb(251_191_36/0.25)]'
      : rank === 2
        ? 'text-sky-700 shadow-[0_2px_8px_-2px_rgb(56_189_248/0.35)] dark:text-sky-300 dark:shadow-none'
        : 'text-slate-500 dark:text-slate-400'
  const diskFill =
    rank === 1
      ? 'fill-amber-500/15 dark:fill-amber-400/12'
      : rank === 2
        ? 'fill-sky-500/13 dark:fill-sky-400/10'
        : 'fill-slate-500/[0.08] dark:fill-slate-400/[0.08]'

  return (
    <svg className={`${size} ${tint}`} viewBox="0 0 24 24" aria-hidden stroke="currentColor">
      <circle
        cx={12}
        cy={8}
        r={6}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${diskFill}`}
      />
      <polyline
        points="8.21 13.89 7 23 12 17 17 23 15.79 13.88"
        strokeWidth={1.65}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Icon hạng + số trong bảng xếp hạng */
function StandingRankDisplay({ rank, compact }: { rank: number; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 tabular-nums">
      <StandingRankMedalIcon rank={rank} compact={compact} />
      <span className="font-semibold text-stone-900 dark:text-stone-100">{rank}</span>
    </span>
  )
}

function formatStandingDiff(n: number) {
  if (n > 0) return `+${n}`
  return String(n)
}

function StandingsTables({ rows }: { rows: TeamStandingRow[] }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-slate-300/85 bg-slate-50/95 shadow-md shadow-slate-400/28 dark:border-slate-700/50 dark:bg-slate-900/93 dark:shadow-black/45 sm:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-700 text-white dark:bg-blue-900/92 dark:text-slate-100">
              <th scope="col" className="px-3 py-4 text-sm font-semibold lg:px-5">
                Hạng
              </th>
              <th scope="col" className="px-3 py-4 text-sm font-semibold lg:px-5">
                Đội
              </th>
              <th scope="col" className="px-3 py-4 text-sm font-semibold lg:px-5">
                Đã đấu
              </th>
              <th scope="col" className="px-3 py-4 text-sm font-semibold lg:px-5">
                Thắng
              </th>
              <th scope="col" className="px-3 py-4 text-sm font-semibold lg:px-5">
                Thua
              </th>
              <th scope="col" className="px-3 py-4 text-sm font-semibold lg:px-5">
                Điểm thắng
              </th>
              <th scope="col" className="px-3 py-4 text-sm font-semibold lg:px-5">
                Điểm thua
              </th>
              <th scope="col" className="px-3 py-4 text-sm font-semibold lg:px-5">
                Hiệu số
              </th>
              <th
                scope="col"
                className="px-3 py-4 text-sm font-semibold lg:px-5"
                title="Điểm xếp hạng (số trận thắng)"
              >
                Điểm
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const pWin = row.pointsInWins ?? 0
              const pLoss = row.pointsInLosses ?? 0
              const diff = row.pointDiff ?? 0
              return (
                <tr
                  key={`${row.rank}-${row.name}`}
                  className="border-t border-slate-300/65 odd:bg-slate-200/45 dark:border-slate-700/50 dark:odd:bg-slate-800/55"
                >
                  <td className="px-3 py-4 text-stone-900 lg:px-5 dark:text-stone-100">
                    <StandingRankDisplay rank={row.rank} />
                  </td>
                  <td
                    className={`px-3 py-4 font-medium lg:px-5 ${
                      row.name.includes('Hoài')
                        ? 'text-red-700 dark:text-red-400'
                        : 'text-lime-900 dark:text-lime-200'
                    }`}
                  >
                    {row.name}
                  </td>
                  <td className="px-3 py-4 tabular-nums text-stone-900 lg:px-5 dark:text-stone-100">
                    {row.played}
                  </td>
                  <td className="px-3 py-4 tabular-nums text-stone-900 lg:px-5 dark:text-stone-100">
                    {row.won}
                  </td>
                  <td className="px-3 py-4 tabular-nums text-stone-900 lg:px-5 dark:text-stone-100">
                    {row.lost}
                  </td>
                  <td className="px-3 py-4 tabular-nums text-stone-900 lg:px-5 dark:text-stone-100">
                    {pWin}
                  </td>
                  <td className="px-3 py-4 tabular-nums text-stone-900 lg:px-5 dark:text-stone-100">
                    {pLoss}
                  </td>
                  <td
                    className={`px-3 py-4 tabular-nums font-medium lg:px-5 ${
                      diff > 0
                        ? 'text-emerald-800 dark:text-emerald-300'
                        : diff < 0
                          ? 'text-rose-800 dark:text-rose-300'
                          : 'text-stone-900 dark:text-stone-100'
                    }`}
                  >
                    {formatStandingDiff(diff)}
                  </td>
                  <td className="px-3 py-4 tabular-nums font-semibold text-stone-900 lg:px-5 dark:text-stone-100">
                    {row.points}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 sm:hidden">
        {rows.map((row) => (
          <article
            key={`${row.rank}-${row.name}`}
            className="rounded-xl border border-slate-300/85 bg-slate-50/92 p-4 shadow-md shadow-slate-400/25 dark:border-slate-700/55 dark:bg-slate-900/88 dark:shadow-black/40"
            aria-label={`Hạng ${row.rank}: ${row.name}`}
          >
            <div className="flex items-start justify-between gap-3">
              <p
                className={`min-w-0 text-lg font-semibold ${
                  row.name.includes('Hoài')
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-lime-900 dark:text-lime-200'
                }`}
              >
                {row.name}
              </p>
              <StandingRankDisplay rank={row.rank} compact />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-stone-700 dark:text-stone-300">
              <div className="flex justify-between gap-2">
                <dt className="text-stone-500 dark:text-stone-400">Đã đấu</dt>
                <dd className="tabular-nums font-medium text-stone-900 dark:text-stone-100">
                  {row.played}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-stone-500 dark:text-stone-400">Thắng</dt>
                <dd className="tabular-nums font-medium text-stone-900 dark:text-stone-100">
                  {row.won}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-stone-500 dark:text-stone-400">Thua</dt>
                <dd className="tabular-nums font-medium text-stone-900 dark:text-stone-100">
                  {row.lost}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-stone-500 dark:text-stone-400">Điểm thắng</dt>
                <dd className="tabular-nums font-medium text-stone-900 dark:text-stone-100">
                  {row.pointsInWins ?? 0}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-stone-500 dark:text-stone-400">Điểm thua</dt>
                <dd className="tabular-nums font-medium text-stone-900 dark:text-stone-100">
                  {row.pointsInLosses ?? 0}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-stone-500 dark:text-stone-400">Hiệu số</dt>
                <dd
                  className={`tabular-nums font-medium ${
                    (row.pointDiff ?? 0) > 0
                      ? 'text-emerald-800 dark:text-emerald-300'
                      : (row.pointDiff ?? 0) < 0
                        ? 'text-rose-800 dark:text-rose-300'
                        : 'text-stone-900 dark:text-stone-100'
                  }`}
                >
                  {formatStandingDiff(row.pointDiff ?? 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-stone-500 dark:text-stone-400" title="Điểm xếp hạng (số trận thắng)">
                  Điểm
                </dt>
                <dd className="tabular-nums font-semibold text-stone-900 dark:text-stone-100">
                  {row.points}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </>
  )
}

function App() {
  const tabRootId = useId()
  const [tab, setTab] = useState<MainTab>('info')
  const [live, setLive] = useState<TournamentApiState | null>(null)

  const infoTabId = `${tabRootId}-tab-info`
  const scheduleTabId = `${tabRootId}-tab-schedule`
  const standingsTabId = `${tabRootId}-tab-standings`
  const infoPanelId = `${tabRootId}-panel-info`
  const schedulePanelId = `${tabRootId}-panel-schedule`
  const standingsPanelId = `${tabRootId}-panel-standings`

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const s = await fetchTournamentState()
      if (!cancelled && s) setLive(s)
    }
    load()
    const id = setInterval(load, 15000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  const displaySchedule = useMemo((): ScheduleRound[] => {
    const sc = live?.scores
    if (!sc) return scheduleRounds
    return scheduleRounds.map((r) => ({
      ...r,
      scoreCourtOne: sc[r.id]?.courtOne ?? r.scoreCourtOne,
      scoreCourtTwo: sc[r.id]?.courtTwo ?? r.scoreCourtTwo,
    }))
  }, [live])

  const standingsRows = useMemo(() => live?.standings ?? teamStandings, [live])

  const tabButtonClass = (active: boolean) =>
    [
      'flex-1 rounded-xl px-2 py-2.5 text-center text-[11px] font-semibold leading-snug transition sm:px-3 sm:text-sm sm:leading-normal',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2',
      'dark:focus-visible:ring-offset-blue-950',
      active
        ? 'bg-red-700 text-white shadow-sm dark:bg-red-900'
        : 'text-stone-600 hover:bg-red-50 dark:text-stone-400 dark:hover:bg-red-950/40',
    ].join(' ')

  return (
    <div className="min-h-svh bg-gradient-to-br from-slate-200/90 via-slate-100 to-blue-200/65 text-stone-800 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 dark:text-stone-200">
      <header className="border-b border-slate-300/85 bg-white/65 backdrop-blur-md dark:border-slate-700/45 dark:bg-blue-950/65">
        <div className="mx-auto max-w-4xl px-4 py-5 text-center sm:px-6 sm:py-6 sm:text-left">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5">
            <div className="flex shrink-0 items-center justify-center sm:justify-start">
              <img
                src="/hust-logo.svg"
                alt="Logo Đại học Bách khoa Hà Nội"
                className="h-24 w-auto max-w-[min(100%,155px)] object-contain drop-shadow-sm sm:h-32 sm:max-w-[min(100%,185px)]"
                width={105}
                height={158}
                loading="eager"
                decoding="async"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-balance text-xl font-bold leading-snug tracking-tight text-stone-900 sm:text-2xl dark:text-stone-50">
                {tournamentMeta.title}
              </h1>
              <p className="mt-1 line-clamp-2 text-pretty text-sm text-stone-600 dark:text-stone-400">
                {tournamentMeta.subtitle}
              </p>
              <p className="mt-2 text-pretty text-xs text-stone-600 sm:text-sm dark:text-stone-400">
                <span className="font-medium text-stone-700 dark:text-stone-300">Thời gian: </span>
                {tournamentMeta.date} tại <VenueMapLink />
              </p>
              <MatchCountdown />
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-4xl px-4 pb-2 pt-4 sm:px-6 sm:pt-5">
          <div
            role="tablist"
            aria-label="Nội dung giải đấu"
            className="flex flex-wrap gap-2 rounded-2xl border border-slate-300/80 bg-white/60 p-1.5 backdrop-blur-sm dark:border-slate-700/55 dark:bg-slate-950/55"
          >
            <button
              type="button"
              role="tab"
              id={infoTabId}
              aria-selected={tab === 'info'}
              aria-controls={infoPanelId}
              className={tabButtonClass(tab === 'info')}
              onClick={() => setTab('info')}
            >
              Thông tin giải đấu
            </button>
            <button
              type="button"
              role="tab"
              id={scheduleTabId}
              aria-selected={tab === 'schedule'}
              aria-controls={schedulePanelId}
              className={tabButtonClass(tab === 'schedule')}
              onClick={() => setTab('schedule')}
            >
              Lịch thi đấu và kết quả
            </button>
            <button
              type="button"
              role="tab"
              id={standingsTabId}
              aria-selected={tab === 'standings'}
              aria-controls={standingsPanelId}
              className={tabButtonClass(tab === 'standings')}
              onClick={() => setTab('standings')}
            >
              Xếp hạng
            </button>
          </div>
        </div>

        <div
          id={infoPanelId}
          role="tabpanel"
          aria-labelledby={infoTabId}
          hidden={tab !== 'info'}
        >
          <TournamentDetailsSection />
          <TeamRosterSection />
        </div>

        <div
          id={schedulePanelId}
          role="tabpanel"
          aria-labelledby={scheduleTabId}
          hidden={tab !== 'schedule'}
        >
          <ScheduleBlock rounds={displaySchedule} />
        </div>

        <div
          id={standingsPanelId}
          role="tabpanel"
          aria-labelledby={standingsTabId}
          hidden={tab !== 'standings'}
        >
          <StandingsBlock rows={standingsRows} />
        </div>
      </main>

      <footer className="border-t border-slate-300/85 bg-white/55 py-8 text-center text-sm text-stone-500 dark:border-slate-700/45 dark:bg-blue-950/55 dark:text-slate-400">
        <p>KSTN K46 — pickerball — chúc các đội thi đấu vui và an toàn.</p>
        <p className="mt-2 text-xs text-stone-400 dark:text-slate-500">
          <a
            href="/admin"
            className="underline decoration-slate-400/80 underline-offset-2 hover:text-stone-600 dark:hover:text-slate-300"
          >
            Nhập tỷ số (admin)
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App
