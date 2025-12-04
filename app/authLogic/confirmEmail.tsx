import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';

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
    <View style={styles.container}>
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
  );
};

export default ConfirmEmail;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontFamily: 'AInterSemi',
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    borderWidth: 2,
    borderColor: 'gainsboro',
    padding: 10,
    marginVertical: 10,
    width: '50%',
    borderRadius: 5,
  },
  button: {
    backgroundColor: 'rgba(173, 216, 230, 0.6)',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginTop: 20,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontFamily: 'AInterSemi',
  },
});
