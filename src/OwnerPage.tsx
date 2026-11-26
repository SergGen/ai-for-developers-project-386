import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { createEventType } from '../generated/sdk/sdk.gen.ts'

type SaveResult =
  | { status: 'idle' | 'saving' | 'failed' }
  | { status: 'saved'; title: string }

export function OwnerPage() {
  const [result, setResult] = useState<SaveResult>({ status: 'idle' })
  const saving = result.status === 'saving'

  async function saveEventType(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return

    const form = event.currentTarget
    const fields = new FormData(form)
    setResult({ status: 'saving' })

    try {
      const { data } = await createEventType({
        body: {
          title: String(fields.get('title')),
          description: String(fields.get('description')),
          durationMinutes: Number(fields.get('durationMinutes')),
        },
        throwOnError: true,
      })
      form.reset()
      setResult({ status: 'saved', title: data.title })
    } catch {
      setResult({ status: 'failed' })
    }
  }

  return (
    <main className="page">
      <title>Админка — Календарь звонков</title>
      <header className="intro">
        <h1>Админка</h1>
        <nav className="page-links" aria-label="Разделы календаря">
          <a href="/admin/upcoming">Предстоящие встречи</a>
          <a href="/book">Каталог типов встреч</a>
        </nav>
      </header>

      <section className="booking-guide" aria-labelledby="event-type-form-title">
        <h2 id="event-type-form-title">Создать тип встречи</h2>
        <form className="event-type-form" onSubmit={saveEventType}>
          <fieldset disabled={saving}>
            <label>
              Название
              <input name="title" required />
            </label>
            <label>
              Описание
              <textarea name="description" rows={3} required />
            </label>
            <label>
              Длительность в минутах
              <input name="durationMinutes" type="number" min={1} max={540} step={1} required />
            </label>
            <button className="booking-link" type="submit">
              {saving ? 'Сохраняем…' : 'Сохранить'}
            </button>
          </fieldset>
          <p role="status">
            {result.status === 'saved' && `Тип встречи «${result.title}» сохранён.`}
          </p>
          {result.status === 'failed' && (
            <p role="alert">Не удалось сохранить тип встречи. Попробуйте ещё раз.</p>
          )}
        </form>
      </section>
    </main>
  )
}
