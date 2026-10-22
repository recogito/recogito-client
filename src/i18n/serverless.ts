import i18next, { type Resource } from 'i18next';
import type { ApiPostInviteUserToProject } from 'src/Types';
import { baseOptions, defaultLocale, supportedLocales } from './config';

// NOTE: only the email namespace is bundled here, not the full set in ./resources
const emailFiles = import.meta.glob<Record<string, string>>(
  '/src/locales/*/email.json',
  { eager: true, import: 'default' }
);

const resources: Resource = {};

for (const [path, translations] of Object.entries(emailFiles)) {
  const lng = path.split('/').slice(-2)[0];
  resources[lng] = { email: translations };
}

export async function getTranslation(
  request: Request,
  body: ApiPostInviteUserToProject
) {
  // attempt to get lang from request headers or body; fallback to default en
  const headerLang = request.headers
    .get('accept-language')
    ?.split(',')[0]
    .split('-')[0];
  const lang =
    [body.lang, headerLang].find((l) => l && supportedLocales.includes(l)) ||
    defaultLocale;

  // create a minimal i18next instance for a single serverless function invocation
  const i18nextInstance = i18next.createInstance();
  await i18nextInstance.init({
    ...baseOptions,
    lng: lang,
    ns: ['email'],
    defaultNS: 'email',
    resources,
  });

  return {
    t: i18nextInstance.getFixedT(lang, 'email'),
    lang,
  };
}
