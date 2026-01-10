import { PubSub } from '@aws-amplify/pubsub';
import Constants from 'expo-constants';

const REGION = Constants.expoConfig?.extra?.ENV_REGION;
const IOT_ENDPOINT = Constants.expoConfig?.extra?.ENV_ENDPOINT;
const ENDPOINT = `wss://${IOT_ENDPOINT}/mqtt`;

console.log('IoT Configuration');
console.log('Region:', REGION);
console.log('IoT Endpoint:', IOT_ENDPOINT);
console.log('Full WebSocket Endpoint:', ENDPOINT);

export const pubsub = new PubSub({
  region: REGION,
  endpoint: ENDPOINT,
});