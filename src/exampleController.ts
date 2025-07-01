import { type Application, json } from 'express'
import { Logger } from './utils/logger'
import path from 'path'
import { getUuids } from './operations/getUuids'

export function exampleController(app: Application, logger: Logger) {
  app.use(json())

  app.use((error, req, res, _next) => {
    if (error != null) {
      logger.error(`Api broke.`, {
        error,
        request: {
          url: req?.url,
          headers: req?.header,
          query: req?.query,
          body: req?.body,
        },
      })
      res.status(500).send({
        code: 'internal server error',
        description: 'Something broke the server.',
        error: error.message,
      })
    }
  })
  app.options('/*', function (_req, res) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.header(
      'Access-Control-Allow-Headers',
      `Content-Type, Authorization, Content-Length`
    )
    res.send(200)
  })

  // only supply next if the execute function does not respond to the request, like middleware
  const wrapAsync = (execute: () => Promise<void>, next?: () => void) => {
    execute()
      .catch((e) => {
        logger.error(e)
      })
      .finally(next)
  }

  // index page
  app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname + '/pages/index.html'))
  })
  app.get('/index.js', (_req, res) => {
    res.sendFile(path.join(__dirname + '/pages/index.js'))
  })
  app.get('/index.css', (_req, res) => {
    res.sendFile(path.join(__dirname + '/pages/index.css'))
  })
  app.get('/log', (_req, res) => {
    res.send(logger.getLogMemory())
  })

  // diagnostics
  app.post('/ping', (_req, res) => {
    logger.info('POST: /ping')
    res.status(200).send({ status: 'ok', time: Date.now })
  })

  app.post('/clearLog', (_rec, res) => {
    logger.clearLogMemory()
    res.status(200).send()
  })

  // webhook endpoint
  app.post('/webhook', (req, res) => {
    logger.info('POST /webhook ', { body: req.body })
    res.status(200).send({})
  })

  // operations
  app.post('/getUuids', (_req, res) => {
    wrapAsync(async () => {
      try {
        await getUuids(logger, 3)
      } catch (error) {
        logger.error(`POST /getUuids failed`, { error })
      }
      res.status(200).send()
    })
  })
}
