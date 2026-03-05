/**
 * Global Application State Store (Zustand)
 *
 * Centralised client-side state management for the dashboard UI.
 * Covers sidebar navigation, current user session, notifications,
 * and active data filters.
 *
 * @see https://zustand.docs.pmnd.rs/
 *
 * @example
 * ```tsx
 * import { useAppStore } from '@/lib/store/app-store';
 *
 * function Sidebar() {
 *   const { sidebarOpen, toggleSidebar } = useAppStore();
 *   return (
 *     <nav className={sidebarOpen ? 'w-64' : 'w-16'}>
 *       <button onClick={toggleSidebar}>Toggle</button>
 *     </nav>
 *   );
 * }
 * ```
 */

import { create } from 'zustand';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

/** Severity level for in-app notifications. */
export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

/** An in-app notification displayed in the dashboard. */
export interface AppNotification {
  /** Unique notification ID (generated automatically). */
  id: string;
  /** Notification title / headline. */
  title: string;
  /** Optional longer description. */
  message?: string;
  /** Severity level controlling icon and colour. */
  severity: NotificationSeverity;
  /** ISO 8601 timestamp when the notification was created. */
  createdAt: string;
  /** Whether the user has read/dismissed this notification. */
  read: boolean;
  /** Optional URL to navigate to when the notification is clicked. */
  actionUrl?: string;
  /** Optional label for the action link. */
  actionLabel?: string;
}

/** The authenticated user (admin operator). */
export interface CurrentUser {
  /** Internal user identifier. */
  id: string;
  /** Display name. */
  name: string;
  /** Email address. */
  email: string;
  /** URL to the user's avatar image. */
  avatarUrl?: string;
  /** User role. */
  role: 'admin' | 'operator' | 'viewer';
}

/** Active filters applied to data views across the dashboard. */
export interface ActiveFilters {
  /** Filter stores by platform. */
  platform?: 'ETSY' | 'SHOPIFY' | null;
  /** Filter by store status. */
  storeStatus?: string | null;
  /** Filter by niche ID. */
  nicheId?: string | null;
  /** Date range start (ISO 8601). */
  dateFrom?: string | null;
  /** Date range end (ISO 8601). */
  dateTo?: string | null;
  /** Free text search query. */
  searchQuery?: string;
}

/** The complete application state shape. */
export interface AppState {
  // ── Sidebar ──────────────────────────────
  /** Whether the sidebar navigation is expanded. */
  sidebarOpen: boolean;
  /** Toggle the sidebar between open and collapsed. */
  toggleSidebar: () => void;
  /** Explicitly set the sidebar state. */
  setSidebarOpen: (open: boolean) => void;

  // ── Navigation ───────────────────────────
  /** Identifier of the currently active page/route. */
  currentPage: string;
  /** Set the active page identifier. */
  setCurrentPage: (page: string) => void;

  // ── User ─────────────────────────────────
  /** The currently authenticated user, or null if not logged in. */
  currentUser: CurrentUser | null;
  /** Set the current user after authentication. */
  setCurrentUser: (user: CurrentUser | null) => void;

  // ── Notifications ────────────────────────
  /** List of in-app notifications, newest first. */
  notifications: AppNotification[];
  /** Add a new notification to the list. */
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  /** Mark a specific notification as read. */
  markNotificationRead: (id: string) => void;
  /** Mark all notifications as read. */
  markAllNotificationsRead: () => void;
  /** Remove a single notification by ID. */
  removeNotification: (id: string) => void;
  /** Clear all notifications. */
  clearNotifications: () => void;
  /** Count of unread notifications. */
  unreadNotificationCount: () => number;

  // ── Filters ──────────────────────────────
  /** Active filters applied across data views. */
  filters: ActiveFilters;
  /** Update one or more filter values. */
  setFilters: (filters: Partial<ActiveFilters>) => void;
  /** Reset all filters to their defaults. */
  resetFilters: () => void;

  // ── UI State ─────────────────────────────
  /** Whether a global loading overlay is shown. */
  isLoading: boolean;
  /** Set the global loading state. */
  setLoading: (loading: boolean) => void;
  /** Optional global loading message. */
  loadingMessage: string;
  /** Set the loading message. */
  setLoadingMessage: (message: string) => void;
}

// ─────────────────────────────────────────────
// DEFAULTS
// ─────────────────────────────────────────────

/** Default filter state. */
const DEFAULT_FILTERS: ActiveFilters = {
  platform: null,
  storeStatus: null,
  nicheId: null,
  dateFrom: null,
  dateTo: null,
  searchQuery: '',
};

// ─────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────

/**
 * Global application state store.
 *
 * Use this hook in any React component to read or update shared UI state.
 * Zustand's selector pattern ensures components only re-render when the
 * specific slice they consume changes.
 *
 * @example
 * ```tsx
 * // Select a single value (minimal re-renders)
 * const sidebarOpen = useAppStore((s) => s.sidebarOpen);
 *
 * // Select multiple values
 * const { currentPage, setCurrentPage } = useAppStore((s) => ({
 *   currentPage: s.currentPage,
 *   setCurrentPage: s.setCurrentPage,
 * }));
 * ```
 */
export const useAppStore = create<AppState>()((set, get) => ({
  // ── Sidebar ──────────────────────────────
  sidebarOpen: true,

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
  },

  // ── Navigation ───────────────────────────
  currentPage: 'dashboard',

  setCurrentPage: (page: string) => {
    set({ currentPage: page });
  },

  // ── User ─────────────────────────────────
  currentUser: null,

  setCurrentUser: (user: CurrentUser | null) => {
    set({ currentUser: user });
  },

  // ── Notifications ────────────────────────
  notifications: [],

  addNotification: (notification) => {
    const newNotification: AppNotification = {
      ...notification,
      id: generateId(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 100),
    }));
  },

  markNotificationRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    }));
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  unreadNotificationCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },

  // ── Filters ──────────────────────────────
  filters: { ...DEFAULT_FILTERS },

  setFilters: (filters: Partial<ActiveFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } });
  },

  // ── UI State ─────────────────────────────
  isLoading: false,

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
    if (!loading) {
      set({ loadingMessage: '' });
    }
  },

  loadingMessage: '',

  setLoadingMessage: (message: string) => {
    set({ loadingMessage: message });
  },
}));

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Generate a short random identifier for notifications. */
function generateId(): string {
  return `notif_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─────────────────────────────────────────────
// SELECTOR HOOKS (convenience re-exports)
// ─────────────────────────────────────────────

/**
 * Hook to get only the sidebar state (minimises re-renders).
 *
 * @example
 * ```tsx
 * const { sidebarOpen, toggleSidebar } = useSidebarState();
 * ```
 */
export function useSidebarState() {
  return useAppStore((s) => ({
    sidebarOpen: s.sidebarOpen,
    toggleSidebar: s.toggleSidebar,
    setSidebarOpen: s.setSidebarOpen,
  }));
}

/**
 * Hook to get only the notification state.
 */
export function useNotifications() {
  return useAppStore((s) => ({
    notifications: s.notifications,
    addNotification: s.addNotification,
    markNotificationRead: s.markNotificationRead,
    markAllNotificationsRead: s.markAllNotificationsRead,
    removeNotification: s.removeNotification,
    clearNotifications: s.clearNotifications,
    unreadCount: s.unreadNotificationCount(),
  }));
}

/**
 * Hook to get only the filter state.
 */
export function useFilters() {
  return useAppStore((s) => ({
    filters: s.filters,
    setFilters: s.setFilters,
    resetFilters: s.resetFilters,
  }));
}
