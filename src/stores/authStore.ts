import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string;
  kyc_status: 'none' | 'phone_verified' | 'pending' | 'approved' | 'rejected';
  kyc_level: number;
  listings_count: number;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  showLoginModal: boolean;
  showRegisterModal: boolean;
  showKYCModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  setShowRegisterModal: (show: boolean) => void;
  setShowKYCModal: (show: boolean) => void;
  initialize: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, metadata: Record<string, string>) => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  showLoginModal: false,
  showRegisterModal: false,
  showKYCModal: false,

  setShowLoginModal: (show) => set({ showLoginModal: show, showRegisterModal: false }),
  setShowRegisterModal: (show) => set({ showRegisterModal: show, showLoginModal: false }),
  setShowKYCModal: (show) => set({ showKYCModal: show }),

  initialize: async () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) {
        setTimeout(() => get().fetchProfile(session.user.id), 0);
      } else {
        set({ profile: null });
      }
    });

    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, loading: false });
    if (session?.user) {
      await get().fetchProfile(session.user.id);
    }
  },

  fetchProfile: async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (data) {
      set({ profile: data as unknown as Profile });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null });
  },

  signUpWithEmail: async (email, password, metadata) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata, emailRedirectTo: window.location.origin },
    });
    return { error: error as Error | null };
  },

  signInWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  },

  signInWithGoogle: async () => {
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    return { error: result.error ? (result.error as Error) : null };
  },

  updateProfile: async (data) => {
    const user = get().user;
    if (!user) return { error: new Error('Non authentifié') };
    const { error } = await supabase
      .from('profiles')
      .update(data as Record<string, unknown>)
      .eq('user_id', user.id);
    if (!error) await get().fetchProfile(user.id);
    return { error: error as Error | null };
  },
}));
