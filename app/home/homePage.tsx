import { signOut } from 'aws-amplify/auth';
import { TouchableOpacity, View, Text,StyleSheet, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const homePage = () => {
   const router = useRouter();
   async function handleSignOut() {
    await signOut()
    router.replace('/authLogic/loginPage');
  }
   return (
         <TouchableOpacity onPress={handleSignOut} style={{ position: 'absolute', top: 10, right: 10 }}>
         <Ionicons name="log-out-outline" size={28} color="#000" />
         <View style={styles.container}>
         <Text>Tab Home</Text>
         </View>
         </TouchableOpacity>
   );
}

export default homePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});