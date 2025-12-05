import { View, Text, StyleSheet,TouchableOpacity } from 'react-native';
import { signOut } from 'aws-amplify/auth';
import { useRouter } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

export default function    Settings() {
    const router = useRouter();
   async function handleSignOut() {
    await signOut()
    router.replace('/authLogic/loginPage');
  }
  return (
   <TouchableOpacity onPress={handleSignOut} style={{ position: 'absolute', top: 10, right: 10 }}>
    <Ionicons name="log-out-outline" size={28} color="#000" />
    <View style={styles.container}>
      <Text>Tab Profile</Text>
    </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});