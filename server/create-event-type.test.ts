import { expect, test } from 'vitest'
import { createApp } from './app.ts'

async function withCatalog(run: (url: string) => Promise<void>) {
  const app = createApp()

  try {
    const address = await app.listen({ host: '127.0.0.1', port: 0 })
    await run(`${address}/api/event-types`)
  } finally {
    await app.close()
  }
}

function postEventType(url: string, title: string, durationMinutes: unknown) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description: 'Короткий звонок', durationMinutes }),
  })
}

test('POST /api/event-types creates a meeting type visible in the catalog', async () => {
  await withCatalog(async (url) => {
    const response = await postEventType(url, 'Знакомство', 15)

    expect(response.status).toBe(201)
    const expected = {
      id: 'znakomstvo',
      title: 'Знакомство',
      description: 'Короткий звонок',
      durationMinutes: 15,
    }
    expect(await response.json()).toEqual(expected)

    const catalog = await fetch(url)
    expect(catalog.status).toBe(200)
    expect(await catalog.json()).toEqual([expected])
  })
})

test('POST /api/event-types takes the first free suffix without changing the title', async () => {
  await withCatalog(async (url) => {
    const initial = await postEventType(url, 'Знакомство', 15)
    expect(initial.status).toBe(201)
    expect(await initial.json()).toMatchObject({ id: 'znakomstvo', title: 'Знакомство' })

    const occupied = await postEventType(url, 'Знакомство 3', 15)
    expect(occupied.status).toBe(201)
    expect(await occupied.json()).toMatchObject({ id: 'znakomstvo-3' })

    const next = await postEventType(url, 'Знакомство', 15)
    expect(next.status).toBe(201)
    expect(await next.json()).toMatchObject({ id: 'znakomstvo-2', title: 'Знакомство' })

    const afterOccupied = await postEventType(url, 'Знакомство', 15)
    expect(afterOccupied.status).toBe(201)
    expect(await afterOccupied.json()).toMatchObject({ id: 'znakomstvo-4', title: 'Знакомство' })
  })
})

test.each([1, 540])('POST /api/event-types accepts %i minutes', async (durationMinutes) => {
  await withCatalog(async (url) => {
    const response = await postEventType(url, 'Знакомство', durationMinutes)

    expect(response.status).toBe(201)
    expect(await response.json()).toMatchObject({ durationMinutes })
  })
})

test.each([0, 1.5, 541, '15'])('POST /api/event-types rejects duration %j', async (durationMinutes) => {
  await withCatalog(async (url) => {
    const response = await postEventType(url, 'Знакомство', durationMinutes)

    expect(response.status).toBe(400)
    expect(await (await fetch(url)).json()).toEqual([])
  })
})
