"use client";

import { create } from "zustand";

import {
  getSession,
  signOut,
  type AuthUser,
} from "@/lib/api/auth";

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  initializeAuth: () => () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  initializeAuth: () => {
    let cancelled = false;

    void getSession()
      .then((result) => {
        if (cancelled) {
          return;
        }

        set({
          user: result?.user ?? null,
          loading: false,
        });
      })
      .catch((error) => {
        console.error("Failed to initialize auth:", error);

        if (cancelled) {
          return;
        }

        set({
          user: null,
          loading: false,
        });
      });

    return () => {
      cancelled = true;
    };
  },

  logout: async () => {
    await signOut();

    set({
      user: null,
      loading: false,
    });
  },
}));