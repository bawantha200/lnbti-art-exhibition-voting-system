
import 'dotenv/config'

if (!process.env.TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL is missing from .env')
}

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL

const { default: app } = await import('./src/app.js')

const port = 5001

app.listen(port, '127.0.0.1', () => {
  console.log(`Test server running at http://127.0.0.1:${port}`)
  console.log('Using TEST_DATABASE_URL')
})
