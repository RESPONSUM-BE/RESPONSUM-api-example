import { environment } from '../environment/environment'
import { getFetch } from '../openApi/fetchWrapper'
import { Logger } from '../utils/logger'

export async function getUuids(
  logger: Logger,
  amount: number = 1
): Promise<string[] | undefined> {
  const fetch = getFetch()

  const {
    data, // only present if 2XX response
    error, // only present if 4XX or 5XX response
  } = await fetch.GET('/uuids/{amount}', {
    params: {
      path: {
        amount,
      },
      header: {
        'Api-Token': environment.apiToken,
      },
    },
  })

  if (error != null) {
    logger.error(`Got an error for GET /uuids/${amount}`, { error })
    return undefined
  } else if (data != null) {
    logger.info(`GET /uuids/${amount} `, { result: data })
    return data
  }
}
