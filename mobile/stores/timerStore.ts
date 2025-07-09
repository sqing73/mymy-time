import { create } from "zustand";

interface ImageSource {
  uri: string;
}

export enum LocalActivityEnum {
  readingBooks = "reading-books",
  watchingTV = "watching-tv",
  playingVideoGames = "playing-video-games",
  listeningToMusic = "listening-to-music",
  studying = "studying",
  workingOut = "working-out",
  eating = "eating",
  sleeping = "sleeping",
  doingHousework = "doing-housework",
  cooking = "cooking",
  meditating = "meditating",
  takingShower = "taking-shower",
  yawning = "yawning",
}

interface TimerState {
  isTimerRunning: boolean;
  selectedValue: number;
  backgroundImage: LocalActivityEnum | ImageSource;
  setIsTimerRunning: (running: boolean) => void;
  setSelectedValue: (value: number) => void;
  setBackgroundImage: (image: LocalActivityEnum | ImageSource) => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  isTimerRunning: false,
  selectedValue: 60, // default value
  backgroundImage: LocalActivityEnum.readingBooks, // default background
  setIsTimerRunning: (running: boolean) => set({ isTimerRunning: running }),
  setSelectedValue: (value: number) => set({ selectedValue: value }),
  setBackgroundImage: (image: LocalActivityEnum | ImageSource) => set({ backgroundImage: image }),
})); 
