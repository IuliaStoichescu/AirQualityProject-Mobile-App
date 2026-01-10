// app/index.tsx
import { getCurrentUser } from 'aws-amplify/auth';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

/*(async () => {
  const s = await fetchAuthSession();
  console.log('Auth session:', s);
  console.log('identityId:', s.identityId);
  console.log('has credentials:', !!s.credentials);
  console.log("IoT endpoint:", process.env.ENV_ENDPOINT);
  console.log("Region:", process.env.ENV_REGION);
})();*/


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
