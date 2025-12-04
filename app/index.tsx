// app/index.tsx
import { View, Text, StyleSheet, ImageBackground, Pressable, Button } from 'react-native';
import { Link } from "expo-router";
import {Href} from 'expo-router'

const MY_ROUTE = "/authLogic/loginPage" as Href
const MY_ROUTE2 = "/authLogic/signUp" as Href
const MY_ROUTE3 = "/authLogic/confirmEmail" as Href

import React, { useEffect, useState } from 'react';
import {ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { getCurrentUser } from 'aws-amplify/auth';

export default function Index() {
  const [checking, setChecking] = useState(true);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        await getCurrentUser();  
        setSignedIn(true);
      } catch {
        setSignedIn(false);
      } finally {
        setChecking(false);
      }
    };

    check();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (signedIn) {
    return <Redirect href="/homePage" />; 
  }

  return <Redirect href="/authLogic/loginPage" />;
}
