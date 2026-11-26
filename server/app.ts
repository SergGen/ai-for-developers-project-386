import Fastify from 'fastify'
import openapiGlue from 'fastify-openapi-glue'
import { fileURLToPath } from 'node:url'
import type { RouteHandlers } from '../generated/sdk/fastify.gen.ts'
import type { EventType } from '../generated/sdk/types.gen.ts'
import { listEventTypes } from './catalog.ts'
import { listSlots } from './slots.ts'
import type { Booking } from './bookings.ts'

export interface AppOptions {
  eventTypes?: readonly EventType[]
  now?: () => Date
  bookings?: readonly Booking[]
}

const specification = fileURLToPath(new URL('../generated/openapi.json', import.meta.url))

export function createApp({ eventTypes = [], now = () => new Date(), bookings = [] }: AppOptions = {}) {
  const app = Fastify()
  const catalog = new Map(eventTypes.map((type) => [type.id, type]))
  const calendar = [...bookings]
  const serviceHandlers: RouteHandlers = {
    listEventTypes: listEventTypes(catalog),
    listSlots: listSlots(catalog, calendar, now),
  }

  app.get('/health', async () => ({ status: 'ok' }))
  app.register(openapiGlue, { specification, serviceHandlers })

  return app
}
