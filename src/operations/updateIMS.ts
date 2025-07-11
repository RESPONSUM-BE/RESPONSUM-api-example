import { environment } from '../environment/environment'
import { getFetch } from '../openApi/fetchWrapper'
import { Logger } from '../utils/logger'
import { components } from '../openApi/schema'
import { getCountriesByFilter } from './getCountriesByFilter'
import { getUuids } from './getUuids'

export async function updateIMS(
  logger: Logger
): Promise<Array<unknown> | undefined> {
  const fetch = getFetch()

  // get a country uuid to link too
  const countries = await getCountriesByFilter('Netherlands', logger)
  if (countries == null || countries.length < 1) {
    logger.warn(`Could not get a country by filter, exiting early`)
    return
  }
  const netherlandsCountryUuid = countries[0].uuid

  // get uuids in the RESPONSUM format (any uuid format will do, but this way is recommended for consistency and performance optimalization)
  const newUuids = await getUuids(logger, 1)
  if (newUuids == null) {
    logger.warn(`Could not generate needed uuids, exiting early`)
    return
  }
  const now = new Date()
  const [newLinkUuid] = newUuids

  // calculate the IMS name of a model that was created with ./createNewIMS.ts today so we can look for it
  const imsName = `api-example ${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`

  // search for an existing IMS to update
  const existingImses = await getExistingImsByName(imsName, logger)
  if (existingImses == null || existingImses.length < 1) {
    logger.warn(
      `Could not get an IMS by name, either run the POST /create example again or update the imsName to filter on in the code`
    )
    return
  }
  const existingIms = existingImses[0]

  // get an IMS update model object with the type, uuid and then only the properties being updated
  const ImsUpdateModel: components['schemas']['information-management-system'] =
    {
      // set the type so our system knows which model is being created
      type: 'information-management-system',
      // set a new uuid to uniquely identify this model
      uuid: existingIms.uuid,

      // update the description, appending the update message
      description: `${existingIms.description}\r\nThis IMS was updated through the API example on ${now.toISOString()}`,
      // set a link, these are always array objects, even if only a single link is allowed, check the link definitions to see if it's a one or many link
      // in this case, we are setting this array to a new link object, which will mean for this property the links will be updated to match the new links array
      // any existing links for this property that are not part of the new link array will be deleted
      // any links in the new link array that did not yet exist will be created
      country: [
        {
          // always set the type, in this case 'link'
          type: 'link',
          // set a new uuid, each link has it's own uuid so we can reference (and delete) it by uuid
          // it is important to not reuse link uuids as links can not be updated, only created and deleted
          uuid: newLinkUuid,
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
              modelUuid: existingIms.uuid,
            },
            {
              role: 'country',
              modelType: 'country',
              modelUuid: netherlandsCountryUuid,
            },
          ],
        },
      ],
    }

  const {
    data, // only present if 2XX response
    error, // only present if 4XX or 5XX response
  } = await fetch.PATCH('/update', {
    params: {
      header: {
        'Api-Token': environment.apiToken,
      },
    },
    // for POST /create, the body is an array of models and/or links to be created
    // in this case we'll only create one model (which happens to have a new link property)
    body: [ImsUpdateModel],
  })

  if (error != null) {
    logger.error(`Got an error for POST /create`, {
      error,
    })
    return undefined
  }
  // example on how to get update models data
  if (data != null) {
    const updatedImsModel = data.find(
      (models) =>
        models.type === 'information-management-system' &&
        models.uuid === existingIms.uuid
    ) as components['schemas']['information-management-system'] | undefined
    // on create, the internal id will also have been set
    const createdImsModelInternalId = updatedImsModel?.internalId

    logger.info(`Updated IMS internal id: ${createdImsModelInternalId}`)
  }

  return data
}

async function getExistingImsByName(
  imsName: string,
  logger: Logger
): Promise<
  Array<components['schemas']['information-management-system']> | undefined
> {
  const fetch = getFetch()

  const {
    data, // only present if 2XX response
    error, // only present if 4XX or 5XX response
  } = await fetch.GET('/information-management-system', {
    params: {
      header: {
        'Api-Token': environment.apiToken,
      },
      query: {
        'param-filter': JSON.stringify({ name: [imsName] }),
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
