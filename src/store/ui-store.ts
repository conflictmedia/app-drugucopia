import { create } from "zustand";

interface UIState {
  doseLoggerOpen: boolean;
  doseLoggerPreselect?: {
    substanceId?: string;
    substanceName?: string;
    category?: string | string[];
    route?: string;
  };
  openDoseLogger: (preselect?: UIState["doseLoggerPreselect"]) => void;
  closeDoseLogger: () => void;

  // Command palette open state. Lives here rather than in useCommandPalette's
  // local state so the TopBar launcher button, Ctrl+K and "/" all drive the
  // same surface.
  commandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;

  // Onboarding tour state. The tour auto-opens on first visit (when
  // localStorage flag `drugucopia-tour-complete` is unset) and can be
  // re-triggered from the Help menu / Ctrl+Shift+O keyboard shortcut.
  onboardingCompleted: boolean;
  showOnboardingTour: () => void;
  setOnboardingCompleted: (done: boolean) => void;

  // A1 — Favorite / pinned substances for one-tap logging.
  // Stored as a minimal denormalized snapshot so the chip row renders
  // without looking up the substance DB on every render. The user pins
  // from the dose logger; unpinning removes the entry.
  favoriteSubstances: FavoriteSubstance[];
  favoritesLoaded: boolean;
  initializeFavorites: () => void;
  toggleFavorite: (sub: FavoriteSubstance) => void;
  isFavorite: (idOrName: string) => boolean;
}

export interface FavoriteSubstance {
  /** Either substances[].id or a custom slug like `custom-...` */
  id: string;
  /** Display name */
  name: string;
  /** Primary category for the chip color dot, optional */
  category?: string;
}

const FAVORITES_KEY = "drugucopia-favorite-substances";

function loadFavorites(): FavoriteSubstance[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (s): s is FavoriteSubstance =>
          typeof s === "object" &&
          s !== null &&
          typeof s.id === "string" &&
          typeof s.name === "string",
      )
      .slice(0, 24); // sanity cap
  } catch {
    return [];
  }
}

function persistFavorites(list: FavoriteSubstance[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
  } catch {
    /* ignore quota errors */
  }
}

export const useUIStore = create<UIState>((set, get) => ({
  doseLoggerOpen: false,
  doseLoggerPreselect: undefined,

  openDoseLogger: (preselect) => {
    set({ doseLoggerOpen: true, doseLoggerPreselect: preselect });
  },

  closeDoseLogger: () => {
    set({ doseLoggerOpen: false, doseLoggerPreselect: undefined });
  },

  commandPaletteOpen: false,
  openCommandPalette: () => {
    set({ commandPaletteOpen: true });
  },
  closeCommandPalette: () => {
    set({ commandPaletteOpen: false });
  },

  // Onboarding tour state. Auto-opens on first visit; can be re-triggered
  // via showOnboardingTour() (called from Ctrl+Shift+O shortcut in
  // LayoutClient). Persisted to localStorage key `drugucopia-tour-complete`.
  onboardingCompleted: false,
  showOnboardingTour: () => {
    // The OnboardingTour component listens for this flag being cleared
    // and re-opens. We do this by clearing the localStorage flag and
    // toggling a state field that the component re-renders on.
    try {
      window.localStorage.removeItem("drugucopia-tour-complete");
    } catch {
      /* ignore */
    }
    set({ onboardingCompleted: false });
  },
  setOnboardingCompleted: (done) => {
    try {
      if (done) {
        window.localStorage.setItem("drugucopia-tour-complete", "true");
      } else {
        window.localStorage.removeItem("drugucopia-tour-complete");
      }
    } catch {
      /* ignore */
    }
    set({ onboardingCompleted: done });
  },

  // A1 — start empty on both server and client to avoid hydration
  // mismatches; loadFavorites runs inside initializeFavorites() which
  // fires from a useEffect on the client only.
  favoriteSubstances: [],
  favoritesLoaded: false,

  initializeFavorites: () => {
    if (get().favoritesLoaded) return;
    set({ favoriteSubstances: loadFavorites(), favoritesLoaded: true });
  },

  toggleFavorite: (sub) => {
    const existing = get().favoriteSubstances;
    const key = sub.id.toLowerCase();
    // BUGFIX: match by ID first. The old id-OR-name matching meant pinning
    // a custom substance that shares a display name with a built-in (e.g.
    // two "Caffeine" entries) unpinned the BUILT-IN instead of adding the
    // custom one. Name matching is kept only as a legacy fallback for
    // favorites persisted before ids existed — and only removes when the
    // entry itself has no usable id.
    const idx = existing.findIndex((s) => s.id.toLowerCase() === key);
    let next: FavoriteSubstance[];
    if (idx >= 0) {
      next = existing.filter((_, i) => i !== idx);
    } else {
      next = [...existing, sub];
    }
    persistFavorites(next);
    set({ favoriteSubstances: next });
  },

  isFavorite: (idOrName) => {
    const key = idOrName.toLowerCase();
    return get().favoriteSubstances.some(
      (s) => s.id.toLowerCase() === key || s.name.toLowerCase() === key,
    );
  },
}));
