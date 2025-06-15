import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

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
    <>
      <StatusBar style="auto" translucent backgroundColor="transparent" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
}
