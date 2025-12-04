import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { signUp } from 'aws-amplify/auth';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const router = useRouter();

  const onSignUpPress = async () => {
    setError('');
    setInfo('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Pawword and confirm password do not match.');
      return;
    }

    try {
      const result = await signUp({
        username: email,     
        password,
        options: {
          userAttributes: {
            email,          
          },
        },
      });

      console.log('Sign up result:', result);

      setInfo('Account created successfully! Please check your email to confirm your account.');
      router.push({ pathname: '/authLogic/confirmEmail', params: { email } });

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setError(errorMessage);
    }
  };

  const goToLogin = () => {
    router.push ('/authLogic/loginPage'); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.screen}>
      <View style={styles.card}>
        <Ionicons name="create-outline" size={80} color="#333" style={{ marginBottom: 10 }} />
      <Text style={styles.title}>Welcome ! Here you create an account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.button} onPress={onSignUpPress}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      {error ? <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text> : null}
      {info ? <Text style={{ color: 'green', marginTop: 10 }}>{info}</Text> : null}

      <TouchableOpacity onPress={goToLogin} style={{ marginTop: 20 }}>
        <Text>Already have an account? <Text style={{ fontWeight: 'bold' }}>Sign In</Text></Text>
      </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  );
};

export default SignUp;

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
