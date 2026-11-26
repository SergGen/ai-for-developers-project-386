import { useEffect, useState } from 'react'
import { listSlots } from '../generated/sdk/sdk.gen.ts'
import type { Slot, SlotWindow } from '../generated/sdk/types.gen.ts'
import { SlotPicker } from './SlotPicker.tsx'
import './BookingPage.css'

type Availability =
  | { status: 'loading' }
  | { status: 'loaded'; window: SlotWindow }
  | { status: 'missing' }
  | { status: 'failed' }

export function BookingPage({ eventTypePath }: { eventTypePath: string }) {
  const [availability, setAvailability] = useState<Availability>({ status: 'loading' })
  const [selectedDay, setSelectedDay] = useState<string>()
  const [selectedSlot, setSelectedSlot] = useState<Slot>()

  useEffect(() => {
    const controller = new AbortController()

    async function loadAvailability() {
      try {
        const { data, response } = await listSlots({
          path: { id: decodeURIComponent(eventTypePath) },
          signal: controller.signal,
        })
        if (controller.signal.aborted) return

        if (data) setAvailability({ status: 'loaded', window: data })
        else setAvailability({ status: response?.status === 404 ? 'missing' : 'failed' })
      } catch {
        if (!controller.signal.aborted) setAvailability({ status: 'failed' })
      }
    }

    void loadAvailability()
    return () => controller.abort()
  }, [eventTypePath])

  function selectDay(day: string) {
    setSelectedDay(day)
    setSelectedSlot(undefined)
  }

  const slotWindow = availability.status === 'loaded' ? availability.window : undefined
  const eventType = slotWindow?.eventType
  const title = eventType?.title ?? 'Выбор слота'

  return (
    <main className="page">
      <title>{`${title} — Календарь звонков`}</title>
      <header className="intro">
        <a className="booking-back" href="/book">К каталогу встреч</a>
        <h1>{title}</h1>
        {eventType && <p>{eventType.description} · {eventType.durationMinutes} мин.</p>}
      </header>

      {availability.status === 'loading' && <p role="status">Загружаем слоты…</p>}
      {availability.status === 'missing' && <p role="alert">Тип встречи не найден.</p>}
      {availability.status === 'failed' && <p role="alert">Не удалось загрузить слоты. Обновите страницу.</p>}
      {slotWindow && (
        <SlotPicker
          days={slotWindow.days}
          slots={slotWindow.slots}
          day={selectedDay ?? slotWindow.days[0]}
          selectedSlot={selectedSlot}
          onDayChange={selectDay}
          onSlotChange={setSelectedSlot}
        />
      )}
    </main>
  )
}
