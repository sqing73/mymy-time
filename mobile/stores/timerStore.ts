import { create } from "zustand";

interface TimerState {
  isTimerRunning: boolean;
  selectedValue: number;
  setIsTimerRunning: (running: boolean) => void;
  setSelectedValue: (value: number) => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  isTimerRunning: false,
  selectedValue: 15, // default value
  setIsTimerRunning: (running: boolean) => set({ isTimerRunning: running }),
  setSelectedValue: (value: number) => set({ selectedValue: value }),
})); 
