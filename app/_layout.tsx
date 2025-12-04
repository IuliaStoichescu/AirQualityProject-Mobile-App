import { Stack } from "expo-router";
import {Amplify} from 'aws-amplify';
import awsconfig from '../src/aws-exports';

Amplify.configure(awsconfig);

export default function RootLayout() {
  return <Stack />;
}
