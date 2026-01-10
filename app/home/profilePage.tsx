import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { fetchUserAttributes, signOut, updatePassword } from 'aws-amplify/auth';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { storage } from '../../src/storage/mmkv';

const Default_Image = 'https://images.ctfassets.net/ub3bwfd53mwy/5WFv6lEUb1e6kWeP06CLXr/acd328417f24786af98b1750d90813de/4_Image.jpg?w=750' ;

export default function Settings() {

  const [displayName, setDisplayName] = useState<string>('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwInfo, setPwInfo] = useState('');
  const [avatarUri, setAvaratUri] = useState(
    storage.getString('profileAvatar') ?? Default_Image
  );
  
  const onChangePassword = async () => {
    setPwError('');
    setPwInfo('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError('New password and confirm password do not match.');
      return;
    }

    try {
      await updatePassword({ oldPassword, newPassword });
      setPwInfo('Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.log('Update password error:', err);
      setPwError(err?.message ?? 'Failed to update password.');
    }
  };


  useEffect(() => {
    const init = async () => {
      const storedName = storage.getString('displayName');

      if (storedName) {
        setDisplayName(storedName);
        return;
      }

      try {
        const attrs = await fetchUserAttributes();
        const email = attrs.email ?? '';
        setDisplayName(email);
        if (email) {
          storage.set('displayName', email);
        }
      } catch (err) {
        console.warn('Failed to load user attributes', err);
      }
    };

    init();
  }, []);

  const router = useRouter();
   async function handleSignOut() {
    await signOut()
    router.replace('/authLogic/loginPage');
  }

  useFocusEffect(
  useCallback(() => {
    const stored = storage.getString("profileAvatar");
    setAvaratUri(stored ?? Default_Image);
  }, [])
);

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (result.canceled) return;

  const tempUri = result.assets?.[0]?.uri;
  if (!tempUri) return;

  if (Platform.OS === "web") {
    const res = await fetch(tempUri);
    const blob = await res.blob();

    const dataUri = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    setAvaratUri(dataUri);
    storage.set("profileAvatar", dataUri);
    return;
  }

  const docDir = FileSystem.documentDirectory;
  if (!docDir) return;

  const permanentUri = docDir + "profile.jpg";

  const info = await FileSystem.getInfoAsync(permanentUri);
  if (info.exists) {
    await FileSystem.deleteAsync(permanentUri, { idempotent: true });
  }

  await FileSystem.copyAsync({
    from: tempUri,
    to: permanentUri,
  });

  setAvaratUri(permanentUri);
  storage.set("profileAvatar", permanentUri);
};

//pick image based on platform 

  return (
    <View style={styles.container}>
   <TouchableOpacity onPress={handleSignOut} style={{ position: 'absolute', top: 10, right: 10 }}>
    <Ionicons name="log-out-outline" size={28} color="#000" />
   </TouchableOpacity>
      <Image
        source={{ uri: avatarUri }}
        style={{ width: 80, height: 80, borderRadius: 40 }}
      />
      <Text style={{ fontSize: 12, fontWeight: '600', marginTop: 12 }}>
        {displayName}
      </Text>
      <View style={styles.divider} />
      <Pressable style={styles.button} onPress={pickImage}>
        <Text style={{ color: 'white', fontSize: 16 }}>Change Profile Picture ✏️</Text>
        </Pressable>
        <View style={styles.divider} />
        <TextInput
          style={styles.input}
          placeholder="Current password"
          secureTextEntry
          value={oldPassword}
          onChangeText={setOldPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="New password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm new password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
          <Pressable style={styles.button} >
        <Text style={{ color: 'white', fontSize: 16 }} onPress={onChangePassword}>Change Password ✏️</Text>
        </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 5,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  button: {
    marginTop: 20,
    padding: 10,  
    alignItems: 'center',
    backgroundColor: '#262632ff',
    borderRadius: 10,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.15)',   // adjust color
    alignSelf: 'stretch',
    marginVertical: 8,
  },
  input: {
    borderWidth: 2,
    width: '80%',
    borderColor: 'gainsboro',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
});