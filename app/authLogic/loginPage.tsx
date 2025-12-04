import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import React, { use } from 'react'
import { useState } from 'react';
import { signIn, signUp, signOut, confirmSignIn } from 'aws-amplify/auth';
import { useRouter } from 'expo-router';

const Login = () => {

  const [email, setEmail ] = useState(''); 
  const [password, setPassword ] = useState(''); 
 // const [userName, setUserName ] = useState(''); 
  const [error, SetError] = useState('');
  const router = useRouter();

  const onSignInPress = async () => {
    //console.warn("Sign In", email);
    SetError('');
    try{
      const {isSignedIn, nextStep} = await signIn({username : email, password});

      console.log('Sign in result', isSignedIn,nextStep);

      if (nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
      router.push({ pathname: '/authLogic/confirmEmail', params: { email } });
      return;
        }
      if (isSignedIn) {
        router.push('/homePage');
        return;
      }
    }
    catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      if (e instanceof Error && e.name === 'UserNotConfirmedException') {
      router.push({ pathname: '/authLogic/confirmEmail', params: { email } });
      return;
    }
      SetError(errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome ! Here you Sign In.</Text>

      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail}/>
      <TextInput style={styles.input} placeholder="Password" secureTextEntry={true} value={password} onChangeText={setPassword}/>

      <TouchableOpacity style={styles.button} onPress={onSignInPress}>
        <Text style={styles.buttonText} >Sign In</Text>
      </TouchableOpacity>
      {error &&<Text style = {{color : 'red'}}>{error}</Text>}
    </View>
  )
}

export default Login

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
})
