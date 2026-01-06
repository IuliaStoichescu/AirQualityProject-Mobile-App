import { PubSub } from '@aws-amplify/pubsub';

const REGION = process.env.ENV_REGION;
const ENDPOINT = process.env.ENV_ENDPOINT;

export const pubsub = new PubSub({
  region: REGION,
  endpoint: ENDPOINT,
});
