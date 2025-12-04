import { resetPassword } from "aws-amplify/auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from 'react-native-safe-area-context';

const ForgotPassword =() => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const onSendCode = async () => {
    setError("");

    try {
      const { nextStep } = await resetPassword({ username: email });

      console.log(nextStep);

      if (nextStep.resetPasswordStep === "CONFIRM_RESET_PASSWORD_WITH_CODE") {
        router.push({
          pathname: "/authLogic/resetPassword",
          params: { email },
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
     <SafeAreaView style={styles.safeArea}>
    <View style={styles.screen}>
      <View style={styles.card}>
        <Ionicons name="alert-circle-outline" size={80} color="#333" style={{ marginBottom: 10 }} />
      <Text style={styles.title}>Type your email for password reset</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={onSendCode}>
        <Text style={styles.buttonText}>Confirm</Text>
      </TouchableOpacity>

      {error ? <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text> : null}

    </View>
    </View>
    </SafeAreaView>
  );
  
}
export default ForgotPassword;

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

