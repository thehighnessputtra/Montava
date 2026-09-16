"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/stores/authStore";

export default function AuthInitializer() {
  const initializeAuth = useAuthStore(
    (state) => state.initializeAuth
  );

  useEffect(() => {
    const unsubscribe = initializeAuth();

    return unsubscribe;
  }, [initializeAuth]);

  return null;
}