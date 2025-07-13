import { create } from "zustand";
import { getImagesFromFileSystem } from "@/lib/imageUtils";

interface ImageSource {
  uri: string;
}

export interface GalleryImage {
  uri: string;
  name: string;
  timestamp: number;
}

interface GalleryState {
  galleryImages: GalleryImage[];
  backgroundImage: ImageSource;
  setGalleryImages: (images: GalleryImage[]) => void;
  setBackgroundImage: (image: ImageSource) => void;
  refreshGalleryImages: () => Promise<void>;
  addGalleryImage: (image: GalleryImage) => void;
  removeGalleryImage: (imageName: string) => void;
}

export const useGalleryStore = create<GalleryState>((set, get) => ({
  galleryImages: [],
  backgroundImage: { uri: "" },
  setGalleryImages: (images: GalleryImage[]) => set({ galleryImages: images }),
  setBackgroundImage: (image: ImageSource) => set({ backgroundImage: image }),
  refreshGalleryImages: async () => {
    try {
      const images = await getImagesFromFileSystem();
      set({ galleryImages: images });
    } catch (error) {
      console.error("Error refreshing gallery images:", error);
    }
  },
  addGalleryImage: (image: GalleryImage) => {
    const currentImages = get().galleryImages;
    set({ galleryImages: [image, ...currentImages] });
  },
  removeGalleryImage: (imageName: string) => {
    const currentImages = get().galleryImages;
    set({ galleryImages: currentImages.filter(img => img.name !== imageName) });
  },
})); 
