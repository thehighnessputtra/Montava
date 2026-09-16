"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { create } from "zustand";

import { auth } from "@/lib/firebase/config";

interface AuthState {
  user: User | null;
  loading: boolean;
  initializeAuth: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({
        user,
        loading: false,
      });
    });

    return unsubscribe;
  },
}));