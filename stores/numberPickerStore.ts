import { create } from 'zustand';

interface NumberPickerState {
  selectedValue: number;
  isOpen: boolean;
  setSelectedValue: (value: number) => void;
  openPicker: () => void;
  closePicker: () => void;
  reset: () => void;
}

export const useNumberPickerStore = create<NumberPickerState>((set) => ({
  selectedValue: 15, // default value
  isOpen: false,
  setSelectedValue: (value: number) => set({ selectedValue: value }),
  openPicker: () => set({ isOpen: true }),
  closePicker: () => set({ isOpen: false }),
  reset: () => set({ selectedValue: 15, isOpen: false }),
})); 
