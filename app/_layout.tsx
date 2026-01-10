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
import { IotProvider, useIot } from "../src/iot/iot_context";
import * as Notifications from 'expo-notifications';
import { fetchAuthSession } from "aws-amplify/auth";

import Constants from 'expo-constants';
import { Alert } from "react-native";
import { BASE_DATA, SensorItem } from "@/src/constants/sensors";
import { useAlertMonitor } from "@/src/hooks/useAlertMonitor";

Amplify.configure({
  ...awsconfig,
  Auth: {
    Cognito: {
      ...(awsconfig as any).Auth?.Cognito, 
      identityPoolId: Constants.expoConfig?.extra?.ENV_IDENTITY_POOL_ID,
      allowGuestAccess: true, 
    },
  },
})


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  }),
});


function AppWrapper() {
  useAlertMonitor(); 
  

SplashScreen.preventAutoHideAsync();
  return <Stack screenOptions={{ headerShown: false }} />;
}
useEffect(() => {
  (async () => {
    try {
      const s = await fetchAuthSession({ forceRefresh: true });
      console.log("identityId", s.identityId);
      console.log("has credentials", !!s.credentials);
    } catch (e) {
      console.log("fetchAuthSession error", e);
    }
  })();
}, []);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...Ionicons.font,
    ...AntDesign.font,
  });

   useEffect(() => {
      (async () => {
       const { status } = await Notifications.requestPermissionsAsync();
       if (status !== 'granted') {
         Alert.alert('Permission not granted to show notifications!');
         return;
       } 
      })();
    },[]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;
  return (
    <PaperProvider>
    <SafeAreaProvider>
      <IotProvider>
      <AppWrapper />
      </IotProvider>
    </SafeAreaProvider>
    </PaperProvider>   
  );
}
