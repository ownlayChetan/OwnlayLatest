import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginCredentials, RegisterData } from '@/types';
import { api } from '@/services/api';
import { useSubscriptionStore } from './subscriptionStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastAuthCheck: number | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// Auth check cache duration: 30 seconds
const AUTH_CHECK_CACHE_DURATION = 30 * 1000;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      lastAuthCheck: null,

      login: async (credentials) => {
        // Performance optimization: Start loading state immediately
        set({ isLoading: true, error: null });
        
        // Performance: Record start time
        const startTime = performance.now();
        
        try {
          const response = await api.login(credentials);
          
          if (response.success && response.data) {
            const { user, access_token } = response.data;
            
            // Performance: Update state in a single batch
            set({
              user,
              token: access_token,
              isAuthenticated: true,
              isLoading: false,
              lastAuthCheck: Date.now(),
            });
            
            // Performance: Initialize subscription from user data immediately (no extra API call)
            const subscriptionStore = useSubscriptionStore.getState();
            subscriptionStore.setSubscriptionFromUser(
              user.plan as any, 
              user.trialEndsAt,
              user.accountType
            );
            
            // Performance: Log login time
            const loginTime = performance.now() - startTime;
            console.log(`Login completed in ${loginTime.toFixed(2)}ms`);
            
            return true;
          } else {
            set({
              error: response.error || 'Login failed',
              isLoading: false,
            });
            return false;
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.register(data);
          
          if (response.success && response.data) {
            const { user, access_token } = response.data;
            
            set({
              user,
              token: access_token,
              isAuthenticated: true,
              isLoading: false,
              lastAuthCheck: Date.now(),
            });
            
            // Initialize subscription with 7-day free trial for new users
            const subscriptionStore = useSubscriptionStore.getState();
            subscriptionStore.setSubscriptionFromUser(
              user.plan as any,
              user.trialEndsAt,
              user.accountType
            );
            
            return true;
          } else {
            set({
              error: response.error || 'Registration failed',
              isLoading: false,
            });
            return false;
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Registration failed';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          await api.logout();
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            lastAuthCheck: null,
          });
          
          // Clear subscription
          useSubscriptionStore.getState().clearSubscription();
        }
      },

      checkAuth: () => {
        const { lastAuthCheck, isAuthenticated } = get();
        
        // Performance: Skip check if recently verified
        if (lastAuthCheck && isAuthenticated && Date.now() - lastAuthCheck < AUTH_CHECK_CACHE_DURATION) {
          return;
        }
        
        const token = localStorage.getItem('ownlay_token');
        const userStr = localStorage.getItem('ownlay_user');
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            set({ 
              user, 
              token, 
              isAuthenticated: true,
              lastAuthCheck: Date.now(),
            });
            
            // Sync subscription from user data
            const subscriptionStore = useSubscriptionStore.getState();
            subscriptionStore.setSubscriptionFromUser(
              user.plan as any,
              user.trialEndsAt,
              user.accountType
            );
          } catch {
            set({ 
              user: null, 
              token: null, 
              isAuthenticated: false,
              lastAuthCheck: Date.now(),
            });
          }
        } else {
          set({
            isAuthenticated: false,
            lastAuthCheck: Date.now(),
          });
        }
      },

      clearError: () => set({ error: null }),
      
      updateUser: (updates) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...updates };
          set({ user: updatedUser });
          
          // Persist to localStorage
          localStorage.setItem('ownlay_user', JSON.stringify(updatedUser));
          
          // Update subscription if plan changed
          if (updates.plan) {
            const subscriptionStore = useSubscriptionStore.getState();
            subscriptionStore.setSubscriptionFromUser(
              updates.plan as any,
              updatedUser.trialEndsAt,
              updatedUser.accountType
            );
          }
        }
      },
    }),
    {
      name: 'ownlay-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        lastAuthCheck: state.lastAuthCheck,
      }),
    }
  )
);

export default useAuthStore;
