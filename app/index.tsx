// app/index.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
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
    return <Redirect href="/home/homePage" />;  
  }

  return <Redirect href="/authLogic/loginPage" />;
}
