/**
 * Metadata for the addItemsToCart action.
 */
export const addItemsToCart = {
  name: 'addItemsToCart',
  // Action's description
  description: 'Description for addItemsToCart',
  author: 'LTI',
  // This action uses a Saga to invoke an endpoint.
  //endpoints: ['externalPrice'],
  // The path to Json schema representing the request Json structure and the example of payload.
  input: './schema/input.json',
  packageId: 'sundyne-b2b-osf-dev-app'
};
