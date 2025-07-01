import { Environment } from "./environment-types";

/*
  To get started:
  - Copy this file to src\environment\environment.ts (note the different filename) and continue in the copied file
  - Fill in your tenantKey
  - Fill in your apiToken
  - (Optionally) Fill in a fileLogLocation
*/

export const environment: Environment = {
  
  // The base url for the responsum API.
  // If you are connecting to our SaaS production environment then this should be https://api.responsum.app
  apiBaseUrl: 'https://api.responsum.app',
  // The tenant key for your tenant
  // You can find this in the server url in our app if you go to settings > integrations > API documentation, it is in the server url after /v1/
  // Customer support can also help you confirm this when they enable the api for you.
  tenantKey: 'your-tenant-key',
  // The port to start the local express server on, used for listening to webhooks.
  expressPort: 3000,
  // The api token you want to use for this example
  // You can find or generate this in our app if you go to settings > integrations > API tokens
  apiToken: 'your-api-token',
  // Leave undefined to only log to console, or give the path to an existing folder on your system and each run will generate a new log file there with the console output
  fileLogLocation: undefined
}