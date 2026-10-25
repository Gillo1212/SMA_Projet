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
