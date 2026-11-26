import { createApp } from './app.ts'

const app = createApp()
const address = await app.listen({ host: '127.0.0.1', port: 3000 })

console.log(`API listening at ${address}`)
