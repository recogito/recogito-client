import de from './de';
import en from './en';

export const languages = {
  en: 'English',
  de: 'Deutsch',
};

export const defaultLang = 'en';

const labels = { de, en };

const defaultLabels = labels[defaultLang];

export const getLangFromUrl = (url: URL) => {
  const [, lang] = url.pathname.split('/');
  if (lang in labels) return lang as keyof typeof labels;
  return defaultLang;
}

export const getTranslations = (request: Request, dictionary: keyof typeof defaultLabels) => {
  const lang = getLangFromUrl(new URL(request.url));

  return {
    lang,
    t: {
      ...defaultLabels[dictionary],
      ...labels[lang][dictionary]
    }
  };
}
