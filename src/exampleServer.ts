import { environment } from "./environment/environment"
import express from 'express'
import { getLogger } from "./utils/logger"
import { exampleController } from "./exampleController"

export class ExampleServer {
  private static _instance: ExampleServer | undefined

  public static getInstance() {
    if (this._instance === undefined) this._instance = new ExampleServer()
    return this._instance
  }

  private constructor() {
    const port = environment.expressPort
    // eslint-disable-next-line no-console
    this.startExpress(port).catch((error) => {
      try {
        getLogger().error('Example server core error: ', error)
      } catch (logError) {
        console.error(error)
        console.error(logError)
      }
    })
  }

  private async startExpress(port: number) {
    const logger = getLogger()
    
    const app = express()
    exampleController(app, logger)
    app.listen(port, () => {
      logger.info(`Running on port ${port}`)
    })
  }
}