import { create } from 'zustand';

interface UIState {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  activeModal: string | null;
  announcementVisible: boolean;
}

interface UIActions {
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openModal: (name: string) => void;
  closeModal: () => void;
  setAnnouncementVisible: (v: boolean) => void;
}

export const useUIStore = create<UIState & UIActions>((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  activeModal: null,
  announcementVisible: true,

  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  openModal: (name) => set({ activeModal: name }),
  closeModal: () => set({ activeModal: null }),

  setAnnouncementVisible: (v) => set({ announcementVisible: v }),
}));
