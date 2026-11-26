import Fastify from 'fastify'
import openapiGlue from 'fastify-openapi-glue'
import { fileURLToPath } from 'node:url'
import type { RouteHandlers } from '../generated/sdk/fastify.gen.ts'
import type { EventType } from '../generated/sdk/types.gen.ts'
import { createEventType, listEventTypes } from './catalog.ts'

export interface AppOptions {
  eventTypes?: readonly EventType[]
}

const specification = fileURLToPath(new URL('../generated/openapi.json', import.meta.url))

export function createApp({ eventTypes = [] }: AppOptions = {}) {
  const app = Fastify({ ajv: { customOptions: { coerceTypes: false } } })
  const catalog = new Map(eventTypes.map((type) => [type.id, type]))
  const serviceHandlers: RouteHandlers = {
    listEventTypes: listEventTypes(catalog),
    createEventType: createEventType(catalog),
  }

  app.get('/health', async () => ({ status: 'ok' }))
  app.register(openapiGlue, { specification, serviceHandlers })

  return app
}
