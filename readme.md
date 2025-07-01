# RESPONSUP API example

An example of how to integrate with the RESPONSUM API to accompany our online documentation

## Prerequisites

- Have node v22 or later installed
- Have a tenant with RESPONSUM where the API is enabled
  - Contact customer support to do this for you if needed, this is not a user-managed setting.

## Getting started

- Run npm install in the package root folder
- Copy `src\environment\environment.example.ts` to `src\environment\environment.ts` (note the changed filename)
  This copied file contains will contain all the environment settings, but is git-ignored to avoid checking in any secrets
- In src\environment\environment.ts fill in:
  - **tenantKey**: The tenant key for your tenant  
    You can find this in the server url in our app if you go to settings > integrations > API documentation, it is in the server url after /v1/  
    Customer support can also help you confirm this when they enable the api for you.
  - **apiToken**: The api token you want to use for this example  
    You can find or generate this in our app if you go to settings > integrations > API tokens
- in your CLI run the following command to generate the typescript schema based on your tenant specific openApi spec.json
  - Replace the `[schemaPath]` with the spec.json url
    - It should be along the lines of `https://api.responsum.app/v1/[yourTenantKey]/spec.json` with `[yourTenantKey]` once again replaced with your actual tenant key
    - You can also find it by going to settings > integrations > api documentation and looking at the GET /spec.json endpoint
  - CLI command: `npx openapi-typescript [schemaPath] -o ./src/openApi/schema.d.ts`
- In a CLI run the following command: `npm run start`  
  This will compile and copy all needed files to ./dist and start up the express server
- Navigate to http://localhost:3000/ or whichever expressPort you configured in environment.ts
