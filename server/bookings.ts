import type { Interval } from './schedule.ts'

export interface Booking extends Interval {
  eventTypeId: string
  guestName: string
}
