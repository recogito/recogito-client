import { type ReactNode, createContext, useEffect, useMemo, useState } from 'react';
import type { PostgrestError, RealtimeChannel } from '@supabase/supabase-js';
import type { PresentUser} from '@annotorious/react';
import type { ChangeEvent } from '@recogito/annotorious-supabase';
import { supabase } from '@backend/supabaseBrowserClient';
import { fetchNotes, handleBroadcastEvent, handleCDCEvent } from './postgres';
import type { DocumentNote } from '../Types';
import type { DocumentLayer } from 'src/Types';

interface DocumentNotesContextValue {

  activeLayerId?: string;

  layerIds?: string[];

  notes: DocumentNote[];

  setNotes: React.Dispatch<React.SetStateAction<DocumentNote[]>>;

  channel: RealtimeChannel | undefined,

  setChannel: React.Dispatch<React.SetStateAction<RealtimeChannel | undefined>>;

  present: PresentUser[];

  onError(error: Error | PostgrestError): void;

}

// @ts-ignore
export const DocumentNotesContext = createContext<DocumentNotesContextValue>(); 

interface DocumentNotesProps {

  children: ReactNode;

  channelId: string;

  layers?: DocumentLayer[];

  present: PresentUser[];

  onError(error: Error): void;

}

export const DocumentNotes = (props: DocumentNotesProps) => {

  const { layers, present, onError } = props;

  const layerIds = useMemo(() => layers?.map(l => l.id), [layers]);

  const activeLayerId = useMemo(() => layers?.find(l => l.is_active)?.id, [layers]);

  const [notes, setNotes] = useState<DocumentNote[]>([]);

  const [channel, setChannel] = useState<RealtimeChannel | undefined>();

  useEffect(() => {
    if (layerIds) {
      fetchNotes(layerIds)
        .then(setNotes)
        .catch(onError);

      // Set up realtime channel
      const channel = supabase.channel(props.channelId);

      channel
        .on<ChangeEvent>(
          'postgres_changes', 
          { 
            event: '*', 
            schema: 'public',
            table: 'targets',
            filter: `layer_id=in.(${layerIds.join(', ')})`
          }, 
          handleCDCEvent(props.present, setNotes)
        )
        .on(
          'postgres_changes', 
          { 
            event: '*', 
            schema: 'public',
            table: 'bodies',
            filter: `layer_id=in.(${layerIds.join(', ')})`
          }, 
          handleCDCEvent(props.present, setNotes)
        )
        .on(
          'broadcast', 
          { event: 'change' }, 
          handleBroadcastEvent(setNotes));

      channel.subscribe();

      setChannel(channel);
    
      return () => {
        channel.unsubscribe();
        setChannel(undefined);
      }
    }
  }, [layerIds, props.present]);

  return (
    <DocumentNotesContext.Provider value={{ 
      activeLayerId,
      notes, 
      setNotes, 
      channel, 
      setChannel,
      layerIds,
      present,
      onError
    }}>
      {props.children}
    </DocumentNotesContext.Provider>
  )

}
