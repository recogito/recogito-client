import { useEffect } from 'react';
import type { Extension } from '@recogito/studio-sdk';
import { preloadExtension } from './extensionMountUtils';

export const usePreloadExtensions = (extensions: { extension: Extension }[]) => {
  const key = extensions.map(e => e.extension.component_name).join('|');

  useEffect(() => {
    key.split('|').filter(Boolean).forEach(name =>
      preloadExtension(name).catch(() => { /* retried on mount via getLazy */ })
    );
  }, [key]);
}