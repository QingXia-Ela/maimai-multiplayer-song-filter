import { defineStore } from 'pinia'

export type ThemeMode = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'mm-theme-mode'

function isThemeMode(v: unknown): v is ThemeMode {
  return v === 'system' || v === 'light' || v === 'dark'
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: 'system' as ThemeMode,
  }),
  actions: {
    init() {
      if (typeof window === 'undefined') return
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (isThemeMode(raw)) this.mode = raw
      } catch {
        // ignore
      }
      this.applyToDom()
    },
    setMode(mode: ThemeMode) {
      this.mode = mode
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, mode)
        } catch {
          // ignore
        }
      }
      this.applyToDom()
    },
    applyToDom() {
      if (typeof document === 'undefined') return
      const root = document.documentElement
      if (this.mode === 'system') {
        root.removeAttribute('data-theme')
      } else {
        root.setAttribute('data-theme', this.mode)
      }
    },
  },
})

