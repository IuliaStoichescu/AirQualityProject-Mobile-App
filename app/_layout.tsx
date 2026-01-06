import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Amplify } from 'aws-amplify';
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from 'react';
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../src/amplifyconfiguration';
import awsconfig from '../src/aws-exports';

Amplify.configure({
  ...awsconfig,
  Auth: {
    Cognito: {
      ...(awsconfig as any).Auth?.Cognito, 
      identityPoolId: process.env.ENV_IDENTITY_POOL_ID,
      allowGuestAccess: true, 
    },
  },
});
//configureIoTAuth();
SplashScreen.preventAutoHideAsync();



export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...Ionicons.font,
    ...AntDesign.font,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;
  return (
    <PaperProvider>
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
    </PaperProvider>   
  );
}
