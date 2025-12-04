import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

const ConfirmEmail = () => {
  const router = useRouter();
  const params = useLocalSearchParams();           
  const [email, setEmail] = useState(
    typeof params.email === 'string' ? params.email : ''
  );
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const onConfirmPress = async () => {
    setError('');
    setInfo('');

    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });

      setInfo('Email confirmed successfully!');
      router.push('/authLogic/loginPage');   
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setError(errorMessage);
    }
  };

  const onResendCode = async () => {
    setError('');
    setInfo('');
    try {
      await resendSignUpCode({ username: email });
      setInfo('The confirmation code has been resent to your email.');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setError(errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.screen}>
      <View style={styles.card}>
        <Ionicons name="shield-checkmark-outline" size={80} color="#333" style={{ marginBottom: 10 }} />
      <Text style={styles.title}>Confirm email</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmation Code"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
      />

      <TouchableOpacity style={styles.button} onPress={onConfirmPress}>
        <Text style={styles.buttonText}>Confirm</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ marginTop: 10 }} onPress={onResendCode}>
        <Text>Resend the code</Text>
      </TouchableOpacity>

      {error ? <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text> : null}
      {info ? <Text style={{ color: 'green', marginTop: 10 }}>{info}</Text> : null}
    </View>
    </View>
    </SafeAreaView>
  );
};

export default ConfirmEmail;

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
