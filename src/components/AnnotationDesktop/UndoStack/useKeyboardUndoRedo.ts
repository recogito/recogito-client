import { useEffect, useRef } from 'react';
import { type Annotation, type Annotator, useAnnotator } from '@annotorious/react';
import type { SupabasePlugin } from '@recogito/annotorious-supabase';

export const isMac = (() => {
  if (typeof navigator === 'undefined') return false;

  return navigator.userAgent.indexOf('Mac OS X') !== -1;
})();

const isEditable = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

export const useKeyboardUndoRedo = (backend: ReturnType<typeof SupabasePlugin>) => {
  const anno = useAnnotator<Annotator>();

  // Undo/redo queue
  const queue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    if (!anno) return;

    const restore = (annotations: Annotation[]) => {
      annotations.forEach(a => {
        queue.current = queue.current
          .then(() => backend.restoreAnnotation(a))
          .catch(error => { 
            console.error('Could not restore annotation', a);
            console.error(error);
          });
      });
    };

    // Note: undo/redo history capture local changes made by this
    // user ONLY. Changes are debounced and aggregated within 250ms, 
    // to prevent massively long histories with tiny changes (= user
    // dragging a shape!).
    // 
    // In practice, deletes should rarely mix with other actions, but 
    // in theory they could be paired with other actions! We'd need to 
    // think through possible error scenarios!
    const undo = () => {
      const changes = anno.peekUndo();
      if (!changes) return;
      
      const deleted = changes.deleted ?? [];
      if (deleted.length > 0) {
        // Because Supabase soft-deletes annotations, a restore
        // would cause a "duplicate id" error in the backend.
         
        // 1. Suppress lifecycle events for this restore
        anno.undo({ silent: true });

        // 2. Handle the actual backend restore op separately
        // Restore deleted via the safe un-archive method
        restore(deleted);

        // TODO we'd need to trigger separate create/update actions 
        // on the backend here!
      } else {
        anno.undo();
      }
    }

    const redo = () => {
      const changes = anno.peekRedo();
      if (!changes) return;

      const created = changes.created ?? [];
      if (created.length > 0) {
        anno.redo({ silent: true });
        restore(created);
      } else {
        anno.redo();
      }
    }
    
    const onWinKeyDown = (evt: Event) => {
      const event = evt as KeyboardEvent;
      if (isEditable(event.target)) return;
      if (!event.ctrlKey) return;

      const key = event.key.toLowerCase();
      if (key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (key === 'y' || (key === 'z' && event.shiftKey)) {
        event.preventDefault();
        redo();
      }
    };

    const onMacKeyDown = (evt: Event) => {
      const event = evt as KeyboardEvent;
      if (isEditable(event.target)) return;

      if (event.key.toLowerCase() === 'z' && event.metaKey) {
        event.preventDefault();
        event.shiftKey ? redo() : undo();
      }
    }

    if (isMac)
      document.addEventListener('keydown', onMacKeyDown);
    else
      document.addEventListener('keydown', onWinKeyDown);

    return () => {
      if (isMac)
        document.removeEventListener('keydown', onMacKeyDown);
      else
        document.removeEventListener('keydown', onWinKeyDown);
    }
  }, [anno, backend]);

}