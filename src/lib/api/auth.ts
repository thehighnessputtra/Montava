import { apiRequest } from "./client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  session: {
    id: string;
    token: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
    ipAddress: string | null;
    userAgent: string | null;
    userId: string;
  };
  user: AuthUser;
};

export async function signUp(data: {
  name: string;
  email: string;
  password: string;
}) {
  return apiRequest<AuthSession>(
    "/api/v1/auth/sign-up/email",
    {
      method: "POST",
      body: data,
    },
  );
}

export async function signIn(data: {
  email: string;
  password: string;
}) {
  return apiRequest<AuthSession>(
    "/api/v1/auth/sign-in/email",
    {
      method: "POST",
      body: data,
    },
  );
}

export async function getSession() {
  return apiRequest<AuthSession | null>(
    "/api/v1/auth/get-session",
  );
}

export async function signOut() {
  return apiRequest<{ success: boolean }>(
    "/api/v1/auth/sign-out",
    {
      method: "POST",
      body: {},
    },
  );
}