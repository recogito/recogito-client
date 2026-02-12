import i18next from 'i18next';
import { i18n } from 'astro:config/server';
import type { ApiPostInviteUserToProject } from 'src/Types';
import enEmail from '../../public/locales/en/email.json';
import deEmail from '../../public/locales/de/email.json';
// NOTE: i18n JSON has to be bundled directly here, as this runs
// in a serverless function and will not have access to the filesystem

export async function useTranslation(
  request: Request,
  body: ApiPostInviteUserToProject
) {
  // attempt to get lang from request headers or body; fallback to default en
  const supportedLangs = (i18n?.locales as string[]) || ['en', 'de'];
  const defaultLocale = i18n?.defaultLocale || 'en';
  const headerLang = request.headers
    .get('accept-language')
    ?.split(',')[0]
    .split('-')[0];
  const lang =
    [body.lang, headerLang].find((l) => l && supportedLangs.includes(l)) ||
    defaultLocale;

  // create a minimal i18next instance for a single serverless function invocation
  const i18nextInstance = i18next.createInstance();
  await i18nextInstance.init({
    lng: lang,
    fallbackLng: 'en',
    ns: ['email'],
    defaultNS: 'email',
    interpolation: { escapeValue: false },
    resources: {
      en: { email: enEmail },
      de: { email: deEmail },
    },
  });

  return {
    t: i18nextInstance.getFixedT(lang, 'email'),
    lang,
  };
}
