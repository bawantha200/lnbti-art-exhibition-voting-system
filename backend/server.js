
import app from './src/app.js'
import { validateEnvironment } from './src/config/environment.js'
import 'dotenv/config'

try {
  validateEnvironment()

  const port = Number(process.env.PORT || 5000)

  app.listen(port, '0.0.0.0', () => {
    console.log(`LNBTI voting server listening on 0.0.0.0:${port}`)
  })
} catch (error) {
  console.error(`Server startup failed: ${error.message}`)
  process.exit(1)
}
