import { expect, test } from 'vitest'
import { createApp } from './app.ts'

test('GET /api/bookings/upcoming returns an empty list before any bookings', async () => {
  const app = createApp()

  try {
    const address = await app.listen({ host: '127.0.0.1', port: 0 })
    const response = await fetch(`${address}/api/bookings/upcoming`)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual([])
  } finally {
    await app.close()
  }
})

test('GET /api/bookings/upcoming returns future meetings of all types by start time', async () => {
  const consultation = {
    id: 'konsultatsiya',
    title: 'Консультация',
    description: 'Обсудим вопросы по проекту',
    durationMinutes: 30,
  }
  const review = {
    id: 'razbor',
    title: 'Разбор',
    description: 'Разберём проект',
    durationMinutes: 60,
  }
  let now = new Date('2026-11-26T21:00:00Z')
  const app = createApp({ eventTypes: [consultation, review], now: () => now })

  try {
    const address = await app.listen({ host: '127.0.0.1', port: 0 })
    const bookings = [
      { eventTypeId: consultation.id, guestName: 'София', startsAt: '2026-11-30T09:00:00.000Z' },
      { eventTypeId: review.id, guestName: 'Анна', startsAt: '2026-11-30T06:00:00.000Z' },
      { eventTypeId: review.id, guestName: 'Борис', startsAt: '2026-11-30T08:00:00.000Z' },
    ]
    for (const booking of bookings) {
      const response = await fetch(`${address}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      })
      expect(response.status).toBe(201)
    }

    now = new Date('2026-11-30T07:30:00.000Z')
    const response = await fetch(`${address}/api/bookings/upcoming`)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual([
      { eventType: review, guestName: 'Борис', startsAt: '2026-11-30T08:00:00.000Z', endsAt: '2026-11-30T09:00:00.000Z' },
      { eventType: consultation, guestName: 'София', startsAt: '2026-11-30T09:00:00.000Z', endsAt: '2026-11-30T09:30:00.000Z' },
    ])
  } finally {
    await app.close()
  }
})
