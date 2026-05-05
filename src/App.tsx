import {
  rosterSections,
  tournamentMeta,
  type RosterRow,
  type RosterSection,
} from './data/roster'

function RosterRowCard({ row }: { row: RosterRow }) {
  return (
    <article
      className="rounded-xl border border-emerald-900/15 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-emerald-100/10 dark:bg-zinc-900/70"
      aria-label={`${row.teamHoai} đối ${row.teamHuyen}`}
    >
      <div className="grid grid-cols-2 gap-3 text-left">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-800/80 dark:text-emerald-300/80">
            Team Hoài
          </p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {row.teamHoai}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-teal-800/80 dark:text-teal-300/80">
            Team Huyền
          </p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {row.teamHuyen}
          </p>
        </div>
      </div>
      {row.note ? (
        <p className="mt-3 border-t border-zinc-200/80 pt-3 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {row.note}
        </p>
      ) : null}
    </article>
  )
}

function RosterSectionBlock({ section }: { section: RosterSection }) {
  return (
    <section
      className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6"
      aria-labelledby={`heading-${section.id}`}
    >
      <h2
        id={`heading-${section.id}`}
        className="mb-6 text-center text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50"
      >
        {section.label}
      </h2>

      {/* Desktop / tablet: table */}
      <div className="hidden overflow-hidden rounded-2xl border border-emerald-900/15 bg-white/90 shadow-md dark:border-emerald-100/10 dark:bg-zinc-900/80 sm:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-emerald-700 text-white dark:bg-emerald-900/90">
              <th scope="col" className="px-5 py-4 text-sm font-semibold">
                Team Hoài
              </th>
              <th scope="col" className="px-5 py-4 text-sm font-semibold">
                Team Huyền
              </th>
              <th scope="col" className="hidden px-5 py-4 text-sm font-semibold md:table-cell">
                Ghi chú
              </th>
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row) => (
              <tr
                key={`${section.id}-${row.teamHoai}-${row.teamHuyen}`}
                className="border-t border-zinc-200/90 odd:bg-zinc-50/80 dark:border-zinc-700 dark:odd:bg-zinc-800/40"
              >
                <td className="px-5 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                  {row.teamHoai}
                </td>
                <td className="px-5 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                  {row.teamHuyen}
                </td>
                <td className="hidden px-5 py-4 text-sm text-zinc-600 md:table-cell dark:text-zinc-400">
                  {row.note ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="flex flex-col gap-4 sm:hidden">
        {section.rows.map((row) => (
          <RosterRowCard key={`${section.id}-${row.teamHoai}-${row.teamHuyen}`} row={row} />
        ))}
      </div>
    </section>
  )
}

function App() {
  return (
    <div className="min-h-svh bg-gradient-to-b from-emerald-50 via-white to-teal-50 text-zinc-800 dark:from-zinc-950 dark:via-zinc-950 dark:to-emerald-950/40 dark:text-zinc-200">
      <header className="border-b border-emerald-900/10 bg-white/70 backdrop-blur-md dark:border-emerald-100/10 dark:bg-zinc-950/70">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-16">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
            KSTN46
          </p>
          <h1 className="mb-4 text-balance text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl md:text-5xl dark:text-zinc-50">
            {tournamentMeta.title}
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-zinc-600 dark:text-zinc-400">
            {tournamentMeta.subtitle}
          </p>
          <dl className="mt-8 flex flex-col gap-2 text-sm text-zinc-700 sm:flex-row sm:justify-center sm:gap-8 dark:text-zinc-300">
            <div>
              <dt className="sr-only">Thời gian</dt>
              <dd>{tournamentMeta.date}</dd>
            </div>
            <div>
              <dt className="sr-only">Địa điểm</dt>
              <dd>{tournamentMeta.venue}</dd>
            </div>
          </dl>
        </div>
      </header>

      <main>
        {rosterSections.map((section) => (
          <RosterSectionBlock key={section.id} section={section} />
        ))}
      </main>

      <footer className="border-t border-emerald-900/10 bg-white/50 py-8 text-center text-sm text-zinc-500 dark:border-emerald-100/10 dark:bg-zinc-950/50 dark:text-zinc-500">
        <p>kstn46-pickerball — chúc các đội thi đấu vui và an toàn.</p>
      </footer>
    </div>
  )
}

export default App
