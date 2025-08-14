import { type Application, json } from 'express'
import { Logger } from './utils/logger'
import path from 'path'
import { getUuids } from './operations/getUuids'
import { getCountriesByFilter } from './operations/getCountriesByFilter'
import { createNewIMS } from './operations/createNewIMS'
import { updateIMS } from './operations/updateIMS'
import { createNewUserWithPermissions } from './operations/createNewUserWithPermissions'

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
        const amount = 3
        const uuids = await getUuids(logger, amount)
        logger.info(`GET /uuids/${amount} `, { result: uuids })
      } catch (error) {
        logger.error(`POST /getUuids failed`, { error })
      }
      res.status(200).send()
    })
  })

  app.post('/getCountriesByFilter', (_req, res) => {
    wrapAsync(async () => {
      try {
        const countries = await getCountriesByFilter('Belgium', logger)
        logger.info(`GET /country with a filter `, {
          result: countries,
        })
      } catch (error) {
        logger.error(`POST /getCountriesByFilter failed`, { error })
      }
      res.status(200).send()
    })
  })

  app.post('/createNewIMS', (_req, res) => {
    wrapAsync(async () => {
      try {
        const createResult = await createNewIMS(logger)
        logger.info(
          `POST /create for information-management-system including a link to a country `,
          {
            result: createResult,
          }
        )
      } catch (error) {
        logger.error(`POST /createNewIMS failed`, { error })
      }
      res.status(200).send()
    })
  })

  app.post('/updateIMS', (_req, res) => {
    wrapAsync(async () => {
      try {
        const createResult = await updateIMS(logger)
        logger.info(
          `PATCH /update for information-management-system, updating the description and the country link `,
          {
            result: createResult,
          }
        )
      } catch (error) {
        logger.error(`POST /updateIMS failed`, { error })
      }
      res.status(200).send()
    })
  })

  app.post('/createNewUserWithPermissions', (_req, res) => {
    wrapAsync(async () => {
      try {
        const createResult = await createNewUserWithPermissions(logger)
        logger.info(`POST /create for user-account with permissions `, {
          result: createResult,
        })
      } catch (error) {
        logger.error(`POST /createNewUserWithPermissions failed`, { error })
      }
      res.status(200).send()
    })
  })
}
