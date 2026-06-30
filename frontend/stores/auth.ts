'use client'

import { create } from 'zustand'

type AuthState = {
  accessToken?: string
  setAccessToken: (accessToken?: string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: undefined,
  setAccessToken: (accessToken) => set({ accessToken }),
}))
