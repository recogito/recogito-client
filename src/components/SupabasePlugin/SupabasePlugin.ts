import { useEffect, useState } from 'react';
import { useAnnotator } from '@annotorious/react';
import type { Annotation, Annotator, PresentUser, User } from '@annotorious/react';
import { SupabasePlugin as Supabase } from '@recogito/annotorious-supabase';
import type { SupabasePluginConfig, OffPageActivityEvent } from '@recogito/annotorious-supabase';
import type { PostgrestError } from '@supabase/supabase-js';
import { useAppearanceProvider } from '@components/Presence';

// Re-export isMe utility
export { isMe } from '@recogito/annotorious-supabase';

export type SupabasePluginProps = SupabasePluginConfig & {

  privacyMode: boolean,

  onConnected?(user: User): void,

  onConnectError?(error: string): void,

  onInitialLoad?(annotations: Annotation[]): void,

  onInitialLoadError?(error: PostgrestError): void,

  onIntegrityError?(message: string): void,

  onOffPageActivity?(event: OffPageActivityEvent): void,

  onPresence?(users: PresentUser[]): void,

  onSaveError?(error: PostgrestError): void,

  onSelectionChange?(user: PresentUser): void

}

export const SupabasePlugin = (props: SupabasePluginProps) => {

  const anno = useAnnotator<Annotator<Annotation, Annotation>>();

  const [plugin, setPlugin] = useState<ReturnType<typeof Supabase>>();

  const appearanceProvider = useAppearanceProvider();

  useEffect(() => {
    if (anno) {
      const supabase = Supabase(anno, {...props, appearanceProvider });

      supabase
        .connect()
        .then(user => props.onConnected?.(user))
        .catch(error => { 
          console.error('Connection error', error);
          props.onConnectError?.(error);
        });

      supabase.on('initialLoad', annotations => props.onInitialLoad?.(annotations));
      supabase.on('integrityError', message => props.onIntegrityError?.(message));
      supabase.on('offPageActivity', event => props.onOffPageActivity?.(event));
      supabase.on('presence', users => props.onPresence?.(users));
      supabase.on('selectionChange', user => props.onSelectionChange?.(user));
      supabase.on('initialLoadError', error => {
        console.error('Initial load error', error);
        props.onInitialLoadError?.(error)
      });
      supabase.on('saveError', error => {
        console.error('Save error', error);
        props.onSaveError?.(error)
      });

      setPlugin(supabase);

      return () => {
        supabase.destroy();
      }
    }
  }, [
    anno, 
    props.onPresence
  ]);

  useEffect(() => {
    if (plugin)
      plugin.privacyMode = props.privacyMode;
  }, [props.privacyMode, plugin])

  return null;

}