import type { RouteHandlers } from '../generated/sdk/fastify.gen.ts'
import type { EventType } from '../generated/sdk/types.gen.ts'

export function listEventTypes(catalog: ReadonlyMap<string, EventType>): RouteHandlers['listEventTypes'] {
  return (_request, reply) => {
    reply.code(200).send([...catalog.values()])
  }
}
