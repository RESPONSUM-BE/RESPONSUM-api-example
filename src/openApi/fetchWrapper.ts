import createClient from 'openapi-fetch'
import type { paths } from './schema'
import { environment } from '../environment/environment'

export function getFetch() {
  const baseUrl = `${environment.apiBaseUrl}/v1/${environment.tenantKey}/`
  return createClient<paths>({ baseUrl })
}
