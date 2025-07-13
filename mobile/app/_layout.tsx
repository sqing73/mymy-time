import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ToastProvider } from "@/components/ToastContext";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { storePresetImages } from "@/lib/imageUtils";
import { useGalleryStore } from "@/stores/galleryStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { refreshGalleryImages, setBackgroundImage } = useGalleryStore();
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

        const isFirstTime = await AsyncStorage.getItem("isFirstTime");
        
        if (isFirstTime === null) {
          await AsyncStorage.setItem("isFirstTime", "false");
          const presetImages = process.env.EXPO_PUBLIC_PRESET_IMAGES?.split(",") || [];
          await storePresetImages(presetImages);
        }

        await refreshGalleryImages();
        setBackgroundImage({ uri: FileSystem.documentDirectory + `images/reading-books.png` });
      } catch (error) {
        console.error("Error in prepareApp:", error);
      }
    };

    if (!loaded) {
      prepareApp();
    }

    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, refreshGalleryImages, setBackgroundImage]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ToastProvider>
          <StatusBar style="auto" translucent backgroundColor="transparent" />
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="number-picker" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen name="gallery" options={{ headerShown: false }} />
          </Stack>
        </ToastProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
