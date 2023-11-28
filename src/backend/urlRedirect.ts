import { atom } from 'nanostores';

export const $redirectUrl = atom<string | undefined>(undefined);

export function setRedirectUrl(url: string | undefined) {
  $redirectUrl.set(url);
}

export const $clientRedirect = atom<string | undefined>(undefined);

export function setClientRedirect(url: string | undefined) {
  $clientRedirect.set(url);
}
