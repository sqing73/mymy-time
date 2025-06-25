import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    "LXGWWenKaiMonoTC-Regular": require("../assets/fonts/LXGWWenKaiMonoTC-Regular.ttf"),
    "LXGWWenKaiMonoTC-Bold": require("../assets/fonts/LXGWWenKaiMonoTC-Bold.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" translucent backgroundColor="transparent" />
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
    </GestureHandlerRootView>
  );
}
