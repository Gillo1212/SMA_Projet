import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sma-green': '#1AAA3F',
        'sma-green-dark': '#0D8C2E',
        'sma-dark': '#00272B',
        'sma-blue': '#25A9F2',
        'sma-cream': '#EEFFF2',
        // Fond neutre chaud pour alterner les sections
        'sma-sand': '#F6F3EC',
        // Vert lisible sur le fond bleu nuit (mots en italique des titres)
        'sma-mint': '#4FD07A',
      },
      // Apparitions courtes (pages, fenêtres) : à utiliser avec motion-safe:
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'sheet-up': { from: { opacity: '0', transform: 'translateY(24px) scale(0.98)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: {
        'fade-up': 'fade-up 0.3s ease-out both',
        'fade-in': 'fade-in 0.2s ease-out both',
        'sheet-up': 'sheet-up 0.28s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        // Petits libellés en capitales espacées (menu, surtitres)
        meta: ['"ADLaM Display"', 'Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
