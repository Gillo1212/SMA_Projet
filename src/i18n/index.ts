import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import messages from './local/index';

/** Clé de persistance du choix de langue */
export const LANGUAGE_STORAGE_KEY = 'smalim_language';

export const SUPPORTED_LANGUAGES = [
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'en', label: 'English', short: 'EN' },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Le site s'adresse d'abord au marché sénégalais : le français est la
    // langue par défaut et le repli quand une clé manque en anglais.
    fallbackLng: 'fr',
    supportedLngs: SUPPORTED_LANGUAGES.map(l => l.code),
    resources: messages,
    debug: false,
    detection: {
      // Le choix explicite de l'utilisateur prime sur la langue du navigateur
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
    interpolation: {
      // React échappe déjà les valeurs interpolées
      escapeValue: false,
    },
  });

export default i18n;
