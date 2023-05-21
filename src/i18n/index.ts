import de from './de.json';
import en from './en.json';

export const languages = {
  en: 'English',
  de: 'Deutsch',
};

export const defaultLang = 'en';

const labels = { de, en };

export const getLangFromUrl = (url: URL) => {
  const [, lang] = url.pathname.split('/');
  if (lang in labels) return lang as keyof typeof labels;
  return defaultLang;
}

export const useTranslations = (lang: keyof typeof labels) =>
  (key: keyof typeof labels[typeof defaultLang]) => labels[lang][key] || labels[defaultLang][key];