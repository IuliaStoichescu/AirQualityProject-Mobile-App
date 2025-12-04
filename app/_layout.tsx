import { Stack } from "expo-router";
import {Amplify} from 'aws-amplify';
import awsconfig from '../src/aws-exports';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Slot, useRouter } from 'expo-router';
import { getCurrentUser } from 'aws-amplify/auth';
import { SafeAreaProvider } from 'react-native-safe-area-context';

Amplify.configure(awsconfig);

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
