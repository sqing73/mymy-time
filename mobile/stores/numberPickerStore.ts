import { create } from "zustand";

interface NumberPickerState {
  selectedValue: number;
  setSelectedValue: (value: number) => void;
}

export const useNumberPickerStore = create<NumberPickerState>((set) => ({
  selectedValue: 15, // default value
  setSelectedValue: (value: number) => set({ selectedValue: value }),
}));
