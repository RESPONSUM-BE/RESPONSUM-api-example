/* eslint-disable no-console */
import chalk from 'chalk'
import untruncateJson from 'untruncate-json'
import path from 'path'
import fs from 'fs'
import { environment } from '../environment/environment'
import { safeStringify } from './json'

const fileNameBase = 'responsum-api-example'

class BaseLogger implements Logger {
  private readonly fileLogPath: string | undefined
  private fileLogEntriesBacklog: string[] = []
  private logMemory: string[] = []

  private static _instance: BaseLogger | undefined

  public static getInstance() {
    if (!this._instance) this._instance = new BaseLogger()
    return this._instance as Logger
  }

  private constructor() {
    const fileLogLocation = environment.fileLogLocation
    if (fileLogLocation != null && fileLogLocation.trim() !== '') {
      // eg. '[fileNameBase]_2024_04_19T05_59_54_053Z.log
      const fileName = `${fileNameBase}_${new Date()
        .toISOString()
        .replaceAll(/[^\w\d-]+/g, '_')}.log`
      this.fileLogPath = path.join(fileLogLocation, fileName)
      try {
        fs.writeFileSync(
          this.fileLogPath,
          `Starting log session for ${fileNameBase}\r\n`,
          { encoding: 'utf8' }
        )
      } catch (error) {
        this.error(`Tried to log to file but failed`, {
          error,
          fileLogPath: this.fileLogPath,
        })
        this.fileLogPath = undefined
      }
      this.info(`Logging to file: ${this.fileLogPath}`)
    }
    if (this.fileLogPath != null) {
      // set interval to flush file log
      setInterval(() => {
        this.flushLogMessages()
      }, 200)
    }
  }

  debug(message: string, context?: LogContext, logOptions?: LogOptions): void {
    console.debug(instrumentMessage(message, context, logOptions))
    this.logToFile('debug', message, context, logOptions)
    this.logToMemory('debug', message, context, logOptions)
  }

  error(
    message: string | Error,
    context?: LogContext,
    logOptions?: LogOptions
  ): void {
    if (message instanceof Error) {
      console.error(
        instrumentMessage(
          chalk.red(message.message),
          { ...context, error: message },
          logOptions
        )
      )
      this.logToFile(
        'error',
        message.message,
        { ...context, error: message },
        logOptions
      )
      this.logToMemory(
        'error',
        message.message,
        { ...context, error: message },
        logOptions
      )
    } else {
      console.error(instrumentMessage(chalk.red(message), context, logOptions))
      this.logToFile('error', message, context, logOptions)
      this.logToMemory('error', message, context, logOptions)
    }
  }

  info(message: string, context?: LogContext, logOptions?: LogOptions): void {
    console.info(
      instrumentMessage(chalk.whiteBright(message), context, logOptions)
    )
    this.logToFile('info', message, context, logOptions)
    this.logToMemory('info', message, context, logOptions)
  }

  warn(message: string, context?: LogContext, logOptions?: LogOptions): void {
    console.warn(instrumentMessage(chalk.yellow(message), context, logOptions))
    this.logToFile('warn', message, context, logOptions)
    this.logToMemory('warn', message, context, logOptions)
  }

  clearLogMemory() {
    this.logMemory = []
  }

  getLogMemory() {
    // readonly copy of the log memory
    return [...this.logMemory]
  }

  private logToFile(
    logLevel: string, // debug, error, ...
    message: string,
    context?: LogContext,
    _logOptions?: LogOptions
  ) {
    const serializedTraceDetails = getSerializedTraceDetails(context)
    let formattedMessage = `${new Date().toISOString()} [${logLevel}] ${message}`
    if (serializedTraceDetails !== '{}') {
      formattedMessage += ` DD=${serializedTraceDetails}`
    }
    formattedMessage += '\r\n'
    if (this.fileLogPath != null) {
      this.fileLogEntriesBacklog.push(formattedMessage)
    }
  }

  private flushLogMessages() {
    if (this.fileLogPath != null && this.fileLogEntriesBacklog.length > 0) {
      // Append to the log file
      fs.appendFileSync(this.fileLogPath, this.fileLogEntriesBacklog.join(''), {
        encoding: 'utf8',
      })
    }
    this.fileLogEntriesBacklog = []
  }

  private logToMemory(
    logLevel: string, // debug, error, ...
    message: string,
    context?: LogContext,
    logOptions?: LogOptions
  ) {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`
    this.logMemory.push(
      instrumentMessage(`${currentTime} ${logLevel}:${message}`, context, {
        ...logOptions,
        prettyJson: true,
      })
    )
  }
}

function instrumentMessage(
  message: string,
  context?: LogContext,
  logOptions?: LogOptions
) {
  let serializedTraceDetails = getSerializedTraceDetails(
    context,
    logOptions?.prettyJson ?? false
  )

  return (
    message +
    (serializedTraceDetails !== '{}'
      ? chalk.dim(' ' + serializedTraceDetails)
      : '')
  )
}
function serializeError(error: Error) {
  const errorInfo = {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  }
  if ('context' in error) {
    return { context: error.context as Serializable, ...errorInfo }
  } else {
    return errorInfo
  }
}
function getSerializedTraceDetails(
  context: LogContext | undefined,
  prettyJson: boolean = false
): string {
  let traceDetails: Record<string, Serializable> = {}

  switch (typeof context) {
    case 'undefined':
      // No context
      break
    case 'object':
      if (context instanceof Error) {
        traceDetails = {
          error: serializeError(context),
        }
      } else if ('error' in context && context.error instanceof Error) {
        traceDetails = {
          ...context,
          error: serializeError(context.error),
        }
      } else {
        traceDetails = { ...context }
      }
      break
    case 'string':
      traceDetails = {
        message: context,
      }
      break
  }

  return safeStringify(traceDetails, prettyJson ? 2 : undefined)
}

export interface Logger {
  debug: LogFunction
  info: LogFunction
  warn: LogFunction
  error: ErrorLogFunction
  clearLogMemory: () => void
  getLogMemory: () => string[]
}

interface LogOptions {
  prettyJson?: boolean
}

type LogFunction = (
  message: string,
  context?: LogContext,
  logOptions?: LogOptions
) => void
type ErrorLogFunction = (
  message: string | Error,
  context?: LogContext,
  logOptions?: LogOptions
) => void

type LogContext = Record<string, any> | Error

type SerializablePrimitive = boolean | number | string | undefined
type SerializableT<T> =
  | T
  | ArrayLike<SerializableT<T>>
  | { [key: string]: SerializableT<T> }
type Serializable = SerializableT<SerializablePrimitive>

export const getLogger = () => BaseLogger.getInstance()
