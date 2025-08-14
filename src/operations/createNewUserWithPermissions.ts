import { environment } from '../environment/environment'
import { getFetch } from '../openApi/fetchWrapper'
import { Logger } from '../utils/logger'
import { components } from '../openApi/schema'
import { getUuids } from './getUuids'

export async function createNewUserWithPermissions(
  logger: Logger
): Promise<Array<unknown> | undefined> {
  const fetch = getFetch()

  // get uuids in the RESPONSUM format (any uuid format will do, but this way is recommended for consistency and performance optimalization)
  const newUuids = await getUuids(logger, 3)
  if (newUuids == null) {
    logger.warn(`Could not generate needed uuids, exiting early`)
    return
  }

  const [newUserAccountUuid, newPermissionUuid, linkUuid] = newUuids

  const newUserAccountModel: components['schemas']['user-account'] = {
    uuid: newUserAccountUuid,
    type: 'user-account',
    // any normal or power user requires a valid and unique email within the tenant
    email: `${newUserAccountUuid}@example.com`,
    // any user requires a first and last name
    firstName: 'api',
    lastName: 'example',
    // userType 'normal' matches our Promoted users
    userType: 'normal',
    isEnabled: true,
    // we only need to define the link in one of the models for it to be created
    permission: [
      {
        uuid: linkUuid,
        type: 'link',
        linkType: 'permission-user-account',
        links: [
          {
            modelType: 'user-account',
            modelUuid: newUserAccountUuid,
            role: 'user-account',
          },
          {
            modelType: 'permission',
            modelUuid: newPermissionUuid,
            role: 'permission',
          },
        ],
      },
    ],
  }

  const newPermissionModel: components['schemas']['permission'] = {
    uuid: newPermissionUuid,
    type: 'permission',
    depth: 'editor',
    models: [
      'compliance-training',
      'enrollment',
      'enrolment-automation',
      'course',
      'phishing-campaign',
      'phishing-attempt',
      'processing-activity',
      'processed-data-lifecycle',
      'transfer-impact-assessment',
      'balancing-test',
      'data-protection-impact',
      'legal-obligation',
      'data-subject-request-status',
      'data-subject-request-type',
      'data-subject-request-source',
      'data-subject-request',
      'framework-section',
      'control',
      'control-requirement',
      'evidence',
      'security-asset',
      'risk',
      'mitigation',
      'risk-threat',
      'incident',
      'information-management-system',
      'process',
      'project',
      'policy',
      'legal-template',
      'legislation',
      'advice',
      'legal-ground',
      'stakeholder',
      'stakeholder-contact',
      'agreement',
      'export-configuration',
      'assessments-2',
      'widget-dashboard',
      'reporting-widget',
      'import-file',
      'template-library',
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
    body: [newUserAccountModel, newPermissionModel],
  })

  if (error != null) {
    logger.error(`Got an error for POST /create`, {
      error,
    })
    return undefined
  }
  // example on how to get create models uuids
  if (data != null) {
    const createdUserAccountModel = data.find(
      (models) =>
        models.type === 'user-account' && models.uuid === newUserAccountUuid
    ) as components['schemas']['user-account'] | undefined
    // on create, the internal id will also have been set
    const createdUserAccountModelInternalId =
      createdUserAccountModel?.internalId

    logger.info(
      `Created user account internal id: ${createdUserAccountModelInternalId}`
    )
  }

  return data
}
