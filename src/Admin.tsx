import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { fetchTournamentState, saveTournamentScores, type ScoresMap } from './api/tournament'
import { ScheduleCourtLine } from './courtLine'
import { scheduleRounds, teamLabels, type ScheduleCourt } from './data/roster'

function emptyScoresMap(): ScoresMap {
  const m: ScoresMap = {}
  for (const r of scheduleRounds) {
    m[r.id] = { courtOne: '', courtTwo: '' }
  }
  return m
}

function buildTrimmedPayload(map: ScoresMap): ScoresMap {
  const trimmed: ScoresMap = {}
  for (const r of scheduleRounds) {
    const s = map[r.id] || {}
    const c1 = s.courtOne?.trim()
    const c2 = s.courtTwo?.trim()
    const entry: { courtOne?: string; courtTwo?: string } = {}
    if (c1) entry.courtOne = c1
    if (c2) entry.courtTwo = c2
    if (Object.keys(entry).length > 0) trimmed[r.id] = entry
  }
  return trimmed
}

type CourtKey = 'courtOne' | 'courtTwo'

type MatchModalState = {
  roundId: string
  courtKey: CourtKey
  roundIndex: number
}

type MatchEditModalProps = {
  open: boolean
  titleId: string
  roundNumber: number
  courtLabel: string
  court: ScheduleCourt
  initialScore: string
  isSaving?: boolean
  onClose: () => void
  onSave: (value: string) => void | Promise<void>
}

function MatchEditModal({
  open,
  titleId,
  roundNumber,
  courtLabel,
  court,
  initialScore,
  isSaving = false,
  onClose,
  onSave,
}: MatchEditModalProps) {
  const [draft, setDraft] = useState(initialScore)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setDraft(initialScore)
  }, [open, initialScore])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const handleSave = async () => {
    await Promise.resolve(onSave(draft.trim()))
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/55 p-4 pt-[8vh] backdrop-blur-[2px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-lg rounded-2xl border border-slate-300/90 bg-white shadow-2xl dark:border-slate-600 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h2 id={titleId} className="text-lg font-bold text-stone-900 dark:text-stone-50">
            Vòng {roundNumber} · {courtLabel}
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Nhập hoặc sửa tỷ số trận đôi</p>
        </div>
        <div className="space-y-4 px-5 py-4">
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/90 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/50">
            <ScheduleCourtLine court={court} />
          </div>
          <div>
            <label htmlFor={titleId + '-score'} className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Tỷ số ({teamLabels.hoai} trước — {teamLabels.huyen} sau)
            </label>
            <input
              ref={inputRef}
              id={titleId + '-score'}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="vd. 11–8"
              className="w-full rounded-xl border border-itg-green-muted/70 bg-white px-3 py-2.5 font-mono text-base tabular-nums outline-none ring-itg-red/30 focus:ring-2 dark:border-stone-600 dark:bg-stone-950"
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void handleSave()
                }
              }}
            />
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Định dạng: <span className="font-mono">11–8</span> — số trước là {teamLabels.hoai}, số sau là {teamLabels.huyen}. Để trống và
            lưu để xóa tỷ số trận này (chưa có kết quả).
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-stone-200 dark:hover:bg-slate-800"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="rounded-xl bg-itg-red-dark px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-itg-red disabled:opacity-60"
          >
            {isSaving ? 'Đang lưu…' : 'Lưu tỷ số'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Admin() {
  const modalTitleId = useId()
  const [scores, setScores] = useState<ScoresMap>(() => emptyScoresMap())
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [modal, setModal] = useState<MatchModalState | null>(null)

  const load = useCallback(async () => {
    const st = await fetchTournamentState()
    if (st?.scores) {
      const next = emptyScoresMap()
      for (const id of Object.keys(next)) {
        const s = st.scores[id]
        if (s) {
          next[id] = {
            courtOne: s.courtOne ?? '',
            courtTwo: s.courtTwo ?? '',
          }
        }
      }
      setScores(next)
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!modal) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [modal])

  const persistToServer = useCallback(async (map: ScoresMap) => {
    setSaving(true)
    setMessage(null)
    const trimmed = buildTrimmedPayload(map)
    const out = await saveTournamentScores(trimmed)
    setSaving(false)
    if (out?.saved) {
      setMessage('Đã lưu lên server. Trang chủ sẽ hiển thị tỷ số & BXH sau vài giây.')
    } else {
      setMessage(
        'Không lưu được. Trên Vercel: bật Storage → Blob cho project itg-pickerball, redeploy, và không cần VITE_API_BASE_URL (để trống). Dev local: chạy npm run dev.',
      )
    }
  }, [])

  const handleSave = () => void persistToServer(scores)

  const modalRound = modal ? scheduleRounds.find((r) => r.id === modal.roundId) : undefined
  const modalCourt: ScheduleCourt | undefined =
    modalRound && modal ? (modal.courtKey === 'courtOne' ? modalRound.courtOne : modalRound.courtTwo) : undefined
  const modalInitial =
    modal && modalRound ? (scores[modal.roundId]?.[modal.courtKey] ?? '') : ''

  return (
    <div className="min-h-svh bg-gradient-to-br from-itg-red-soft via-white to-itg-green-soft px-4 py-10 text-stone-800">
      <div className="mx-auto max-w-4xl">
        <p className="mb-2 text-sm text-stone-500 dark:text-stone-400">
          <a href="/" className="font-medium text-itg-red-dark underline decoration-itg-red-muted dark:text-itg-red">
            ← Về trang giải đấu
          </a>
        </p>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Admin — nhập tỷ số</h1>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
          Chọn <strong>Nhập tỷ số</strong> / <strong>Sửa tỷ số</strong> — <strong>Lưu tỷ số</strong> trong popup sẽ <strong>gửi lên server</strong>{' '}
          Trên <strong>https://itg-pickerball.vercel.app</strong> tỷ số lưu qua{' '}
          <code className="text-stone-800 dark:text-stone-200">/api/state</code> (Vercel Blob). Dev local dùng API{' '}
          <code className="text-stone-800 dark:text-stone-200">127.0.0.1:5050</code> qua proxy Vite. Nút{' '}
          <strong>Lưu lên server</strong> bên dưới lưu toàn bộ bảng một lần.
        </p>
        {message ? (
          <p className="mt-4 rounded-lg border border-slate-300/80 bg-white/80 px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-900/70">
            {message}
          </p>
        ) : null}
        {!loaded ? (
          <p className="mt-8 text-stone-500">Đang tải…</p>
        ) : (
          <>
            <div className="mt-8 overflow-hidden rounded-2xl border border-itg-green-muted/70 bg-white/90 shadow-md dark:border-stone-700/55 dark:bg-stone-900/85">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-itg-red-dark text-white">
                    <th className="px-3 py-3 font-semibold sm:px-4">Vòng</th>
                    <th className="px-3 py-3 font-semibold sm:px-4">Khung giờ</th>
                    <th className="px-3 py-3 font-semibold sm:px-4">Sân 1</th>
                    <th className="px-3 py-3 font-semibold sm:px-4">Sân 2</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleRounds.map((r, ri) => {
                    const s1 = scores[r.id]?.courtOne?.trim()
                    const s2 = scores[r.id]?.courtTwo?.trim()
                    return (
                      <tr
                        key={r.id}
                        className="border-t border-itg-green-muted/50 odd:bg-itg-green-soft/40 dark:border-stone-700/50 dark:odd:bg-stone-800/40"
                      >
                        <td className="whitespace-nowrap px-3 py-3 font-medium text-itg-red-dark dark:text-itg-red sm:px-4">
                          {ri + 1}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 tabular-nums text-stone-700 dark:text-stone-300 sm:px-4">
                          {r.timeSlot}
                        </td>
                        <td className="align-top px-2 py-3 sm:px-3">
                          <MatchCell
                            court={r.courtOne}
                            score={s1}
                            actionLabel={s1 ? 'Sửa tỷ số' : 'Nhập tỷ số'}
                            onOpen={() => setModal({ roundId: r.id, courtKey: 'courtOne', roundIndex: ri })}
                          />
                        </td>
                        <td className="align-top px-2 py-3 sm:px-3">
                          <MatchCell
                            court={r.courtTwo}
                            score={s2}
                            actionLabel={s2 ? 'Sửa tỷ số' : 'Nhập tỷ số'}
                            onOpen={() => setModal({ roundId: r.id, courtKey: 'courtTwo', roundIndex: ri })}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="rounded-xl bg-itg-red-dark px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-itg-red disabled:opacity-60"
              >
                {saving ? 'Đang lưu…' : 'Lưu lên server'}
              </button>
              <button
                type="button"
                onClick={() => void load()}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-stone-300 dark:hover:bg-slate-800"
              >
                Tải lại
              </button>
            </div>
          </>
        )}
      </div>

      {modal && modalCourt ? (
        <MatchEditModal
          open
          titleId={modalTitleId}
          roundNumber={modal.roundIndex + 1}
          courtLabel={modal.courtKey === 'courtOne' ? 'Sân 1' : 'Sân 2'}
          court={modalCourt}
          initialScore={modalInitial}
          isSaving={saving}
          onClose={() => setModal(null)}
          onSave={async (value) => {
            if (!modal) return
            const next: ScoresMap = {
              ...scores,
              [modal.roundId]: {
                ...scores[modal.roundId],
                [modal.courtKey]: value,
              },
            }
            setScores(next)
            await persistToServer(next)
          }}
        />
      ) : null}
    </div>
  )
}

function MatchCell({
  court,
  score,
  actionLabel,
  onOpen,
}: {
  court: ScheduleCourt
  score?: string
  actionLabel: string
  onOpen: () => void
}) {
  return (
    <div className="space-y-2">
      <ScheduleCourtLine court={court} />
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        <p className="min-w-0 text-sm tabular-nums text-stone-700 dark:text-stone-300">
          <span className="font-medium text-stone-600 dark:text-stone-400">Tỷ số:</span>{' '}
          {score ? (
            <span className="font-mono font-semibold text-stone-900 dark:text-stone-100">{score}</span>
          ) : (
            <span className="text-stone-400 dark:text-stone-500">chưa có</span>
          )}
        </p>
        <button
          type="button"
          onClick={onOpen}
          className="shrink-0 rounded-lg border border-itg-red/35 bg-itg-red-soft px-3 py-1.5 text-xs font-semibold text-itg-red-dark shadow-sm transition hover:bg-itg-red-muted/60 dark:border-itg-red/35 dark:bg-itg-red-dark/20 dark:text-itg-red-muted dark:hover:bg-itg-red-dark/35"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  )
}
