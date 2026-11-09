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
        // Entrée des éléments du haut de page (titre, boutons) au chargement
        rise: { from: { opacity: '0', transform: 'translateY(22px)' }, to: { opacity: '1', transform: 'none' } },
        // Changement de page : léger fondu, sans déplacer la mise en page
        'page-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        // Machines du haut de page : flottement très lent
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        // Halo derrière les machines
        // Opacité seulement : un flou agrandi en boucle serait recalculé à chaque image
        glow: { '0%, 100%': { opacity: '0.5' }, '50%': { opacity: '0.9' } },
        // Onde autour du bouton WhatsApp
        ping: { '75%, 100%': { transform: 'scale(1.6)', opacity: '0' } },
      },
      animation: {
        'fade-up': 'fade-up 0.3s ease-out both',
        'fade-in': 'fade-in 0.2s ease-out both',
        'sheet-up': 'sheet-up 0.28s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        rise: 'rise 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) both',
        // backwards : aucun effet une fois terminé (pas de contexte d'empilement permanent)
        'page-in': 'page-in 0.35s ease-out backwards',
        float: 'float 7s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        glow: 'glow 6s ease-in-out infinite',
        'ping-slow': 'ping 2.4s cubic-bezier(0, 0, 0.2, 1) infinite',
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
