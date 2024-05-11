import { create } from "zustand";

export type LanguagesSupported =
  | "en"
  | "pl"
  | "de"
  | "fr"
  | "es"
  | "tr"
  | "hi"
  | "ja"
  | "la"
  | "ru"
  | "zh";

export const LanguagesSupportedMap: Record<LanguagesSupported, string> = {
  en: "English",
  pl: "Polish",
  de: "German",
  fr: "French",
  es: "Spanish",
  tr: "Turkish",
  hi: "Hindi",
  ja: "Japanese",
  la: "Latin",
  ru: "Russian",
  zh: "Manadarin",
};

const LANGUAGES_IN_FREE = 2;

interface LanguageState {
  language: LanguagesSupported;
  setLanguage: (language: LanguagesSupported) => void;
  getLanguages: () => LanguagesSupported[];
  getNotSupportedLanguages: () => LanguagesSupported[];
}

export const useLanguageStore = create<LanguageState>()((set, get) => ({
  language: "en",
  setLanguage: (language: LanguagesSupported) => set({ language }),
  getLanguages: () => {

      return Object.keys(LanguagesSupportedMap) as LanguagesSupported[];
  },
  getNotSupportedLanguages: () => {
    return []; 


  },
}));

