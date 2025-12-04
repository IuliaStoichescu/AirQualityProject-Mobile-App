import { Ionicons } from "@expo/vector-icons";
import { confirmResetPassword } from "aws-amplify/auth";
import { useRouter, useLocalSearchParams, } from "expo-router";
import { useState } from "react";
import { StyleSheet , View, Text, TextInput, TouchableOpacity} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

const ResetPassword = () => {
  const { email } = useLocalSearchParams();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async () => {
    try {
      await confirmResetPassword({
        username: String(email),
        confirmationCode: code,
        newPassword,
      });

      router.replace("/authLogic/loginPage");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
      <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
         <View style={styles.card}>
            <Ionicons name="planet-outline" size={80} color="#333" style={{ marginBottom: 10 }} />
            <Text style={styles.title}>Reset your password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirmation Code"
              value={code}
               onChangeText={setCode}
               autoCapitalize="none"
              />
              <TextInput
              style={styles.input}
              placeholder="New Password"
              value={newPassword}
               onChangeText={setNewPassword}
               secureTextEntry
              />
              <TouchableOpacity style={styles.button} onPress={onSubmit}>
                      <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
              {error ? <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text> : null}
            </View>
            </View>
      </SafeAreaView>
  );
}

export default ResetPassword;

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