import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { Tabs, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Menu } from 'react-native-paper';
import { storage } from '../storage/mmkv';
import { useIot } from './iot_context';
const Default_Image = 'https://images.ctfassets.net/ub3bwfd53mwy/5WFv6lEUb1e6kWeP06CLXr/acd328417f24786af98b1750d90813de/4_Image.jpg?w=750' ;

function HeaderAvatar() {
  const router = useRouter();
  const [avatarUri, setAvatarUri] = useState(Default_Image);

  const loadAvatar = useCallback(async () => {
    const stored = storage.getString("profileAvatar");

    if (!stored) {
      setAvatarUri(Default_Image);
      return;
    }

    // If it's a local file, make sure it still exists
    if (stored.startsWith("file://")) {
      const info = await FileSystem.getInfoAsync(stored);
      if (!info.exists) {
        storage.remove("profileAvatar");
        setAvatarUri(Default_Image);
        return;
      }
    }

    setAvatarUri(stored);
  }, []);

  useEffect(() => {
    loadAvatar(); // runs on cold start
  }, [loadAvatar]);

  useFocusEffect(
    useCallback(() => {
      loadAvatar(); // runs when navigating back
    }, [loadAvatar])
  );

  return (
    <Pressable onPress={() => router.push("/home/profilePage")}>
      <Image source={{ uri: avatarUri }} style={{ width: 34, height: 34, borderRadius: 17, marginRight: 12 }} />
    </Pressable>
  );
}

function RightHeaderGroup() {
  const { latest } = useIot();
  const [cloudVisible, setCloudVisible] = useState(false);
  const [batteryVisible, setBatteryVisible] = useState(false);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      
      <Menu
        visible={cloudVisible}
        onDismiss={() => setCloudVisible(false)}
        anchor={
          <Pressable onPress={() => setCloudVisible(true)} style={{ marginRight: 15 }}>
            <Ionicons name="cloud-done-outline" size={22} color="white" />
          </Pressable>
        }
      >
        <View style={{ padding: 10 }}>
          <Text style={{ fontWeight: 'bold' }}>Cloud Status</Text>
          <Text>{latest ? "Connected to MQTT" : "Disconnected"}</Text>
        </View>
      </Menu>

      <Menu
        visible={batteryVisible}
        onDismiss={() => setBatteryVisible(false)}
        anchor={
          <Pressable onPress={() => setBatteryVisible(true)} style={{ marginRight: 15 }}>
            <Ionicons name="battery-charging" size={22} color="#4CAF50" />
          </Pressable>
        }
      >
        <View style={{ padding: 10 }}>
          <Text style={{ fontWeight: 'bold' }}>Device Battery Info</Text>
          <Text>Level: 85%</Text>
          <Text style={{ color: 'green' }}>Charging</Text>
        </View>
      </Menu>

      <HeaderAvatar />
    </View>
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
          headerRight: () => <RightHeaderGroup />,
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
