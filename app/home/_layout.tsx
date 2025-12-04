import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
         width: '100%',
         position: 'absolute',
         bottom: 24,
         alignSelf: "center",  
         borderRadius: 999,
         height: 64,
         backgroundColor: '#262632ff',
         shadowColor: '#000',
         shadowOpacity: 0.08,
         shadowRadius: 12,
         shadowOffset: { width: 0, height: 4 },
         elevation: 4,
        },
        tabBarActiveTintColor: '#82f1eeff',
        tabBarInactiveTintColor: '#555',
      }}
    >
      <Tabs.Screen
        name="homePage"            
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"           
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
