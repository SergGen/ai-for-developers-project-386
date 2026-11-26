const timeZone = 'Europe/Moscow'
const daysInBookingWindow = 14
const slotStepMinutes = 15

export interface Interval {
  startsAt: string
  endsAt: string
}

export function bookingDays(now: Date): string[] {
  const today = Temporal.Instant.fromEpochMilliseconds(now.getTime())
    .toZonedDateTimeISO(timeZone)
    .toPlainDate()

  return Array.from({ length: daysInBookingWindow }, (_, index) => today.add({ days: index + 1 }).toString())
}

export function slotsForDay(day: string, durationMinutes: number): Interval[] {
  const date = Temporal.PlainDate.from(day)
  if (date.dayOfWeek > 5) return []

  const opening = date.toZonedDateTime({ timeZone, plainTime: '09:00' })
  const closing = date.toZonedDateTime({ timeZone, plainTime: '18:00' })
  const lastStart = closing.subtract({ minutes: durationMinutes })
  const intervals: Interval[] = []

  for (let start = opening; Temporal.ZonedDateTime.compare(start, lastStart) <= 0; start = start.add({ minutes: slotStepMinutes })) {
    intervals.push({
      startsAt: start.toInstant().toString({ fractionalSecondDigits: 3 }),
      endsAt: start.add({ minutes: durationMinutes }).toInstant().toString({ fractionalSecondDigits: 3 }),
    })
  }

  return intervals
}

export function overlaps(first: Interval, second: Interval): boolean {
  return Date.parse(first.startsAt) < Date.parse(second.endsAt)
    && Date.parse(second.startsAt) < Date.parse(first.endsAt)
}
