import { Origin, useAnnotator } from '@annotorious/react';
import type { Annotation, Annotator, StoreChangeEvent } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SelectionURLStateProps {

  backButton?: boolean;

  onInitialSelect?(annotationId: string): void;

}

export const SelectionURLState = (props: SelectionURLStateProps) => {

  const anno = useAnnotator<Annotator<SupabaseAnnotation>>();

  // Flag: initial load complete?
  const [loaded, setLoaded] = useState(false);

  // Flag to 'mute' updateURL when the the selection is programmatically
  // changed in the popState handler.
  const muteSelection = useRef(false);

  // Update the URL in response to a selection event.
  const updateURL = useCallback((selected: string[]) => {
    const hash = selected.length > 0 
      ? `selected=${selected.join(',')}`
      : '';

    const nextURL = 
      `${window.location.pathname}${window.location.search}#${hash}`;

    if (props.backButton) {
      // pushState creates a history entry for the Back button
      window.history.pushState({ selected }, '', nextURL);
    } else {
      // replaceState does not create history entries
      window.history.replaceState({ selected }, '', nextURL);
    }
  }, [props.backButton]);

  // Set the Annotorious selection in response to a browser history event.
  const selectAnnotationsFromHash = useCallback(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const selectedString = params.get('selected');
    
    const uuids = selectedString ? selectedString.split(',') : [];
    
    muteSelection.current = true;
    anno?.setSelected(uuids);
  
    // Keep state in sync with the hash
    history.replaceState({ selected: uuids }, '', window.location.href);

    return uuids;
  }, [anno]);

  useEffect(() => {
    if (!anno) return;

    // Listen to Annotorious selections - unless we
    // triggered it ourself!
    const onSelect = (selected: Annotation[]) => {      
      if (!muteSelection.current) {
        const uuids = (selected || []).map(a => a.id);
        updateURL(uuids);
      } else {
        muteSelection.current = false;
      }
    }

    // Listen to initial load, so we can trigger initial hash selection
    const onInitialLoad = (event: StoreChangeEvent<Annotation>) => {
      setLoaded(true);
      anno.state.store.unobserve(onInitialLoad);
    }

    anno.state.store.observe(onInitialLoad, { origin: Origin.REMOTE });

    anno.on('selectionChanged', onSelect);
    window.addEventListener('popstate', selectAnnotationsFromHash);

    return () => {
      anno.off('selectionChanged', onSelect);
      window.removeEventListener('popstate', selectAnnotationsFromHash);
    }
  }, [anno, updateURL, selectAnnotationsFromHash]);

  useEffect(() => {
    if (loaded) {
      // Initial load
      const uuids = selectAnnotationsFromHash();

      if (props.onInitialSelect && uuids.length > 0)
        props.onInitialSelect(uuids[0]);
    }
  }, [loaded]);

  return null;

}