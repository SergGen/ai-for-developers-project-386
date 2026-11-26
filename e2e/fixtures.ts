import { test as base } from '@playwright/test'
import { createServer } from 'vite'
import { createApp } from '../server/app.ts'
import type { AppOptions } from '../server/app.ts'

export const test = base.extend<{ appOptions: AppOptions }>({
  appOptions: [{}, { option: true }],
  baseURL: async ({ appOptions }, provide) => {
    const app = createApp(appOptions)

    try {
      const api = await app.listen({ host: '127.0.0.1', port: 0 })
      const frontend = await createServer({
        server: {
          host: '127.0.0.1',
          port: 0,
          proxy: { '/api': api, '/health': api },
        },
      })

      try {
        await frontend.listen()
        const frontendUrl = frontend.resolvedUrls?.local[0]
        if (!frontendUrl) throw new Error('Vite did not start a local web server')

        await provide(frontendUrl)
      } finally {
        await frontend.close()
      }
    } finally {
      await app.close()
    }
  },
})

export { expect } from '@playwright/test'
