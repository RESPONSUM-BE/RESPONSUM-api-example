import { environment } from '../environment/environment'
import { getFetch } from '../openApi/fetchWrapper'
import { Logger } from '../utils/logger'
import { components } from '../openApi/schema'

export async function getCountriesByFilter(
  countryName: string,
  logger: Logger
): Promise<Array<components['schemas']['country']> | undefined> {
  const fetch = getFetch()

  const {
    data, // only present if 2XX response
    error, // only present if 4XX or 5XX response
  } = await fetch.GET('/country', {
    params: {
      header: {
        'Api-Token': environment.apiToken,
      },
      query: {
        // using param-filter we can pass in a JSON stringified object of which each property must match exactly with the model we're filtering for
        // each property should be an array though, to allow multiple values to be filtered on per property
        'param-filter': JSON.stringify({ name: [countryName] }),
        // an example for filtering on more than one country name:
        // 'param-filter': JSON.stringify({ name: ['Belgium', 'Netherlands'] }),
      },
    },
  })

  if (error != null) {
    logger.error(`Got an error for GET /country`, {
      error,
    })
    return undefined
  }
  return data
}
