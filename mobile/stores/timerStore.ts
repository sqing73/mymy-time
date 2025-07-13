import { create } from "zustand";

interface TimerState {
  isTimerRunning: boolean;
  countDown: number;
  setIsTimerRunning: (running: boolean) => void;
  setCountDown: (value: number) => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  isTimerRunning: false,
  countDown: 3600, // default value
  setIsTimerRunning: (running: boolean) => set({ isTimerRunning: running }),
  setCountDown: (value: number) => set({ countDown: value }),
})); 
