import { create } from 'zustand';

// Describes the current hero slide's background so the Navbar knows whether
// to render its transparent state with light or dark text. Only relevant on
// the home page; scrolling past the hero flips the Navbar to frosted anyway.
export type HeroTone = 'light' | 'dark';

interface UIState {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  activeModal: string | null;
  announcementVisible: boolean;
  heroTone: HeroTone;
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
  setHeroTone: (tone: HeroTone) => void;
}

export const useUIStore = create<UIState & UIActions>((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  activeModal: null,
  announcementVisible: true,
  heroTone: 'dark',

  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  openModal: (name) => set({ activeModal: name }),
  closeModal: () => set({ activeModal: null }),

  setAnnouncementVisible: (v) => set({ announcementVisible: v }),
  setHeroTone: (tone) => set({ heroTone: tone }),
}));
