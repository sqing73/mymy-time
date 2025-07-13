import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { GalleryImage } from "@/stores/galleryStore";

export const clearImagesDirectory = async () => {
  try {
    const imagesDir = FileSystem.documentDirectory + 'images/';

    // Check if directory exists
    const dirInfo = await FileSystem.getInfoAsync(imagesDir);
    if (!dirInfo.exists) {
      return true;
    }

    // Read all files in the directory
    const files = await FileSystem.readDirectoryAsync(imagesDir);

    // Delete all files
    for (const file of files) {
      const fileUri = imagesDir + file;
      await FileSystem.deleteAsync(fileUri);
    }

    // Remove the directory itself
    await FileSystem.deleteAsync(imagesDir);

    return true;
  } catch (error) {
    console.error("Error clearing images directory:", error);
    return false;
  }
};

export const getImagesFromFileSystem = async (): Promise<GalleryImage[]> => {
  const imagesDir = FileSystem.documentDirectory + "images/";

  // Check if images directory exists
  const dirInfo = await FileSystem.getInfoAsync(imagesDir);
  if (!dirInfo.exists) {
    return [];
  }

  const files = await FileSystem.readDirectoryAsync(imagesDir);

  // Filter for image files and create gallery items
  const imageFiles = files.filter(file =>
    file.endsWith(".png") ||
    file.endsWith(".jpg") ||
    file.endsWith(".jpeg")
  ).map(file => {
    const lastDashIndex = file.lastIndexOf('-');
    const name = lastDashIndex !== -1 ? file.substring(0, lastDashIndex) : file.replace(/\.(png|jpg|jpeg)$/, '');
    
    const timeStampMatch = file.match(/-(\d+)\.(png|jpg|jpeg)$/);
    const timestamp = timeStampMatch ? parseInt(timeStampMatch[1]) : 0;
    
    return {
      uri: `${imagesDir}${file}`,
      name,
      timestamp,
    };
  }).sort((a, b) => {
    return b.timestamp - a.timestamp;
  });

  return imageFiles;
};

export const storePresetImages = async (presetImages: string[]) => {
  const imageMap: Record<string, any> = {
    "reading-books": require("@/assets/images/reading-books.png"),
    "watching-tv": require("@/assets/images/watching-tv.png"),
    "playing-video-games": require("@/assets/images/playing-video-games.png"),
    "listening-to-music": require("@/assets/images/listening-to-music.png"),
    "studying": require("@/assets/images/studying.png"),
    "working-out": require("@/assets/images/working-out.png"),
    "eating": require("@/assets/images/eating.png"),
    "sleeping": require("@/assets/images/sleeping.png"),
    "doing-housework": require("@/assets/images/doing-housework.png"),
    "cooking": require("@/assets/images/cooking.png"),
    "meditating": require("@/assets/images/meditating.png"),
    "taking-shower": require("@/assets/images/taking-shower.png"),
    "yawning": require("@/assets/images/yawning.png"),
  };
  for (const imageName of presetImages) {
    if (imageMap[imageName]) {
      const asset = Asset.fromModule(imageMap[imageName]);
      await asset.downloadAsync();

      const base64 = await FileSystem.readAsStringAsync(asset.localUri!, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const imageUri = FileSystem.documentDirectory + `images/${imageName}-${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(imageUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }
  }
};

export const getImageUriFromFileSystem = async (imageName: string): Promise<string> => {
  const imageUri = FileSystem.documentDirectory + `images/${imageName}.png`;
  const imageInfo = await FileSystem.getInfoAsync(imageUri);
  if (!imageInfo.exists) {
    return "";
  }
  return imageUri;
};

export const writeImageToFileSystem = async (imageBase64: string, imageName: string): Promise<GalleryImage> => {
  const timestamp = Date.now();
  const imageUri = FileSystem.documentDirectory + `images/${imageName}-${timestamp}.png`;
  await FileSystem.writeAsStringAsync(imageUri, imageBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return {uri: imageUri, name: imageName, timestamp};
};
