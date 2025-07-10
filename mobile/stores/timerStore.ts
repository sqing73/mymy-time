import * as FileSystem from "expo-file-system";
import { create } from "zustand";

interface ImageSource {
  uri: string;
}

interface TimerState {
  isTimerRunning: boolean;
  selectedValue: number;
  backgroundImage: ImageSource;
  setIsTimerRunning: (running: boolean) => void;
  setSelectedValue: (value: number) => void;
  setBackgroundImage: (image: ImageSource) => void;
}

const defaultBackgroundImage: ImageSource = { uri: FileSystem.documentDirectory + `images/reading-books.png` };

export const useTimerStore = create<TimerState>((set) => ({
  isTimerRunning: false,
  selectedValue: 60, // default value
  backgroundImage: defaultBackgroundImage, // default background
  setIsTimerRunning: (running: boolean) => set({ isTimerRunning: running }),
  setSelectedValue: (value: number) => set({ selectedValue: value }),
  setBackgroundImage: (image: ImageSource) => set({ backgroundImage: image }),
})); 
