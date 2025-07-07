import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ToastProvider } from '../components/ToastContext';
import * as FileSystem from "expo-file-system";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    "LXGWWenKaiMonoTC-Regular": require("../assets/fonts/LXGWWenKaiMonoTC-Regular.ttf"),
    "LXGWWenKaiMonoTC-Bold": require("../assets/fonts/LXGWWenKaiMonoTC-Bold.ttf"),
  });

  useEffect(() => {
    const prepareApp = async () => {
      try {
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "/images", {
          intermediates: true,
        });
      } catch (error) {
        console.log(error);
      }
    };

    prepareApp();
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ToastProvider>
          <StatusBar style="auto" translucent backgroundColor="transparent" />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </ToastProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
