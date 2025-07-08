import { Drawer } from 'expo-router/drawer';
import { Feather } from '@expo/vector-icons';
import { useTimerStore } from '@/stores/timerStore';

export default function DrawerLayout() {
  const { isTimerRunning } = useTimerStore();
  return (
    <Drawer
      screenOptions={{
        // Disable swipe gesture when timer is running
        swipeEnabled: !isTimerRunning,
        // Drawer background color
        drawerStyle: {
          backgroundColor: "rgb(221, 183, 116)",
          width: 280,
        },
        // Header styling
        headerStyle: {
          backgroundColor: "rgb(221, 183, 116)",
        },
        headerTintColor: "#3b2f2f",
        headerTitleStyle: {
          fontFamily: "LXGWWenKaiMonoTC-Bold",
          fontSize: 18,
        },
        // Drawer item styling
        drawerActiveTintColor: "#3b2f2f",
        drawerInactiveTintColor: "#666",
        drawerLabelStyle: {
          fontFamily: "LXGWWenKaiMonoTC-Regular",
          fontSize: 16,
        },
        // Drawer item background
        drawerActiveBackgroundColor: "rgba(59, 47, 47, 0.1)",
        drawerInactiveBackgroundColor: "transparent",
      }}
    >
      <Drawer.Screen 
        name="index" 
        options={{ 
          title: "Timer",
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Feather name="clock" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="settings" 
        options={{ 
          title: "Settings",
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="gallery" 
        options={{ 
          title: "Gallery",
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Feather name="image" size={size} color={color} />
          ),
        }} 
      />
    </Drawer>
  );
} 
