import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { signIn } from 'aws-amplify/auth';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import {Amplify} from 'aws-amplify';
import awsconfig from '../../src/aws-exports';
Amplify.configure(awsconfig);

const Login = () => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [error, SetError] = useState('');
  const router = useRouter();

  const onSignInPress = async () => {
    SetError('');
    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });

      if (nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        router.push({ pathname: '/authLogic/confirmEmail', params: { email } });
        return;
      }

      if (isSignedIn) {
        router.push('/home/homePage');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      SetError(errorMessage);
    }
  };
  const goToSignUp = () => {
    router.push ('/authLogic/signUp'); 
  };

  const goToForgotPassword = () => {
    router.push ('/authLogic/forgotPassword'); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.card}>
          
          <Ionicons name="person-circle-outline" size={80} color="#333" style={{ marginBottom: 10 }} />
          <Text style={styles.title}>Glad to have you back ! Sign In.</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity  onPress={goToForgotPassword}>
          <Text >Forgot Password ?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onSignInPress}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity onPress={goToSignUp} style={{ marginTop: 20 }}>
                  <Text>Don't have an account? <Text style={{ fontWeight: 'bold' }}>Sign Up !</Text></Text>
                </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '90%',
    maxWidth: 600,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    minHeight: 350,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'AInterSemi',
    fontSize: 26,
    marginBottom: 24,
    textAlign: 'center'
  },
  input: {
    borderWidth: 2,
    borderColor: 'gainsboro',
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
    width: '100%',
  },
  button: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 999,
    marginTop: 20,
    alignSelf: 'center' 
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'AInterSemi',
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginTop: 12,
  },
});
