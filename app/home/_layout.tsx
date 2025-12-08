import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import {View, Text,Image, Pressable} from 'react-native';  
import { Avatar } from '@rneui/themed';
import { useRouter } from "expo-router";
import { storage } from '../storage/mmkv';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { signOut } from 'aws-amplify/auth';

const Default_Image = 'https://images.ctfassets.net/ub3bwfd53mwy/5WFv6lEUb1e6kWeP06CLXr/acd328417f24786af98b1750d90813de/4_Image.jpg?w=750' ;


function HeaderAvatar() {
  const router = useRouter();
  const [avatarUri, setAvatarUri] = useState(
    storage.getString('profileAvatar') ?? Default_Image
  );

  // 🔁 Every time Home tab/screen becomes focused, reload avatar from MMKV
  useFocusEffect(
    useCallback(() => {
      const stored = storage.getString('profileAvatar');
      if (stored) {
        setAvatarUri(stored);
      } else {
        setAvatarUri(Default_Image);
      }
    }, [])
  );

  return (
    <Pressable onPress={() => router.push('/home/profilePage')}>
      <Image
        source={{ uri: avatarUri }}
        style={{ width: 34, height: 34, borderRadius: 17, marginRight: 12}}
      />
    </Pressable>
  );
}

export default function HomeLayout() {
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarShowLabel: true,
        headerStyle:{
          backgroundColor: '#262632ff',
          borderRadius: 25,
        },
        tabBarStyle: {
         width: '100%',
         position: 'absolute',
         bottom: 15,
         alignSelf: "center",  
         borderRadius: 700,
         height: 64,
         backgroundColor: '#262632ff',
         shadowColor: '#000',
         shadowOpacity: 0.08,
         shadowRadius: 12,
         shadowOffset: { width: 0, height: 4 },
         elevation: 4,
        },
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: '#555',
      }}
    >
      <Tabs.Screen
        name="homePage"
        options={{
          title: "Home", 
          headerRight: () => <HeaderAvatar />,
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="leaf" size={24} color="#4CAF50" />
              <Text style={{ fontSize: 15, fontWeight: "600", marginLeft: 8, color: 'white' }}>
                Vitality Home
              </Text>
              <View style={{ alignSelf: 'flex-end' }}>
              </View>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="insightsPage"           
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="notificationsPage"           
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profilePage"           
        options={{
          title: 'Profile',
          headerRight: () => <View style={{ marginRight: 12 }} />,
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="leaf" size={24} color="#4CAF50" />
              <Text style={{ fontSize: 15, fontWeight: "600", marginLeft: 8, color: 'white' }}>
               User Profile
              </Text>
              <View style={{ alignSelf: 'flex-end' }}>
              </View>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
