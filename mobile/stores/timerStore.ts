import * as FileSystem from "expo-file-system";
import { create } from "zustand";

interface ImageSource {
  uri: string;
}

interface TimerState {
  isTimerRunning: boolean;
  countDown: number;
  backgroundImage: ImageSource;
  setIsTimerRunning: (running: boolean) => void;
  setCountDown: (value: number) => void;
  setBackgroundImage: (image: ImageSource) => void;
}

const defaultBackgroundImage: ImageSource = { uri: FileSystem.documentDirectory + `images/reading-books.png` };

export const useTimerStore = create<TimerState>((set) => ({
  isTimerRunning: false,
  countDown: 3600, // default value
  backgroundImage: defaultBackgroundImage, // default background
  setIsTimerRunning: (running: boolean) => set({ isTimerRunning: running }),
  setCountDown: (value: number) => set({ countDown: value }),
  setBackgroundImage: (image: ImageSource) => set({ backgroundImage: image }),
})); 
