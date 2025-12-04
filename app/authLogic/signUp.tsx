import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { signUp } from 'aws-amplify/auth';
import { useRouter } from 'expo-router';

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
    <View style={styles.container}>
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
  );
};

export default SignUp;

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
    backgroundColor: 'rgba(173, 216, 230, 0.6)', // pale blue + opacity
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
