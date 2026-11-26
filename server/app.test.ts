import { expect, test } from 'vitest'
import { createApp } from './app.ts'

test('the server starts and responds to GET /health', async () => {
  const app = createApp()

  try {
    const address = await app.listen({ host: '127.0.0.1', port: 0 })
    const response = await fetch(`${address}/health`)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: 'ok' })
  } finally {
    await app.close()
  }
})

test('GET /api/event-types returns an empty catalog on a fresh start', async () => {
  const app = createApp()

  try {
    const address = await app.listen({ host: '127.0.0.1', port: 0 })
    const response = await fetch(`${address}/api/event-types`)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual([])
  } finally {
    await app.close()
  }
})
