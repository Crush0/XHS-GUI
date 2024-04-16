import express from 'express'
import bodyParser from 'body-parser'
import router from './routes'
import cors from 'cors'
import 'express-async-errors'
import logger from '../logger'
import { getAvailablePort } from '../net'
let app: express.Application | null = null

export const start = async () => {
  const PORT = getAvailablePort(5000)
  return new Promise<number>((resolve) => {
    if (app) {
      resolve(PORT)
      return
    }
    app = express()
    app.use(
      cors({
        origin: '*'
      })
    )
    app.use(bodyParser.json({ limit: '50mb' }))
    app.use(bodyParser.urlencoded({ extended: true, limit: '50mb', parameterLimit: 50000 }))
  
    app.use('/api', router)
    app.use((err, _, res, __) => {
      err.response &&
        res.status(err.response.status || 400).json({
          code: err.response.status || 400,
          message: err.response.statusText
        })
      !err.response &&
        res.status(500).json({
          code: 500,
          message: err
        })
    })
    
  
    app.listen(PORT, () => {
      logger.info(`Backend Server running on port ${PORT}`)
      resolve(PORT)
    })
  })
}
