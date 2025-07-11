import { environment } from '../environment/environment'
import { getFetch } from '../openApi/fetchWrapper'
import { Logger } from '../utils/logger'
import { components } from '../openApi/schema'
import { getCountriesByFilter } from './getCountriesByFilter'
import { getUuids } from './getUuids'

export async function createNewIMS(
  logger: Logger
): Promise<Array<unknown> | undefined> {
  const fetch = getFetch()

  // get a country uuid to link too
  const countries = await getCountriesByFilter('Belgium', logger)
  if (countries == null || countries.length < 1) {
    logger.warn(`Could not get a country by filter, exiting early`)
    return
  }
  const belgianCountryUuid = countries[0].uuid

  // get uuids in the RESPONSUM format (any uuid format will do, but this way is recommended for consistency and performance optimalization)
  const newUuids = await getUuids(logger, 2)
  if (newUuids == null) {
    logger.warn(`Could not generate needed uuids, exiting early`)
    return
  }
  const now = new Date()
  const [newImsUuid, linkUuid] = newUuids

  // get an ims name, we're limiting it here to just the date without time, so that in the next operation we can look it up based on this name
  const imsName = `api-example ${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`

  // get a new IMS model object
  const newImsModel: components['schemas']['information-management-system'] = {
    // set the type so our system knows which model is being created
    type: 'information-management-system',
    // set a new uuid to uniquely identify this model
    uuid: newImsUuid,
    // set some data properties
    name: imsName,
    description: `This IMS was created through the API example on ${now.toISOString()}`,
    // set a link, these are always array objects, even if only a single link is allowed, check the link definitions to see if it's a one or many link
    country: [
      {
        // always set the type, in this case 'link'
        type: 'link',
        // set a new uuid, each link has it's own uuid so we can reference (and delete) it by uuid
        uuid: linkUuid,
        // the link type is specific to this models property, you can reference the openApi spec schema's to reference what it is.
        // this link type can also be used to look up the link definition with the /link-definitions endpoint
        linkType: 'information-management-system-country',
        // links contains the connections or branches of the link, always make sure to reference both the parent model and the model you are linking too
        links: [
          {
            // the role indicates which side of the connection is being defined here, this is particularly important for self-referencing links (parent/child etc.)
            role: 'information-management-system',
            // the modelType & modelUuid together reference a model, this model should either already exits, or be part of this create operation.
            modelType: 'information-management-system',
            modelUuid: newImsUuid,
          },
          {
            role: 'country',
            modelType: 'country',
            modelUuid: belgianCountryUuid,
          },
        ],
      },
    ],
  }

  const {
    data, // only present if 2XX response
    error, // only present if 4XX or 5XX response
  } = await fetch.POST('/create', {
    params: {
      header: {
        'Api-Token': environment.apiToken,
      },
    },
    // for POST /create, the body is an array of models and/or links to be created
    // in this case we'll only create one model (which happens to have a new link property)
    body: [newImsModel],
  })

  if (error != null) {
    logger.error(`Got an error for POST /create`, {
      error,
    })
    return undefined
  }
  // example on how to get create models uuids
  if (data != null) {
    const createdImsModel = data.find(
      (models) =>
        models.type === 'information-management-system' &&
        models.uuid === newImsUuid
    ) as components['schemas']['information-management-system'] | undefined
    // on create, the internal id will also have been set
    const createdImsModelInternalId = createdImsModel?.internalId

    logger.info(`Created IMS internal id: ${createdImsModelInternalId}`)
  }

  return data
}
