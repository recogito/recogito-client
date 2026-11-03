import { i18n } from 'astro:config/client';
import type { InitOptions } from 'i18next';

// NOTE: These are defined in astro.config.mjs; fallback values are just to make TS happy
export const defaultLocale = i18n?.defaultLocale || 'en';

export const supportedLocales = (i18n?.locales as Array<string>) || ['en'];

// options shared by every i18next instance (client, server, serverless)
export const baseOptions: InitOptions = {
  fallbackLng: defaultLocale,
  supportedLngs: supportedLocales,
  defaultNS: 'common',
  interpolation: { escapeValue: false },
};
