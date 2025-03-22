import { create } from "zustand";

interface MenuItemState {
  activeId: number;
  setActiveId: (id: number) => void;
}

export const useMenuItem = create<MenuItemState>((set) => ({
  activeId: 1,
  setActiveId: (id: number) => set({ activeId: id }),
}));
