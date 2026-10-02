import { useEffect } from 'react';
import { type Annotation, type Annotator, type ChangeSet, useAnnotator } from '@annotorious/react';
import type { SupabasePlugin } from '@recogito/annotorious-supabase';

export const isMac = (() => {
  if (typeof navigator === 'undefined') return false;

  return navigator.userAgent.indexOf('Mac OS X') !== -1;
})();

export const useKeyboardUndoRedo = (backend: ReturnType<typeof SupabasePlugin>) => {
  const anno = useAnnotator<Annotator>();

  useEffect(() => {
    if (!anno) return;

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
      
      const hasDeleted = (changes?.deleted ?? []).length > 0;
      if (hasDeleted) {
        // Because Supabase soft-deletes annotations, a restore
        // would cause a "duplicate id" error in the backend.
         
        // 1. Supress lifecycle events for this restore
        anno.undo({ silent: true });

        // 2. Handle the actual backend restore op separately
        restore(changes);
      } else {
        anno.undo();
      }
    }

    const redo = () => {
      const changes = anno.peekRedo();
      if (!changes) return;

      const hasDelete = (changes?.deleted ?? []).length > 0;
      if (hasDelete) {
        anno.redo({ silent: true });
        restore(changes);
      } else {
        anno.redo();
      }
    }

    const restore = (changes: ChangeSet<Annotation>) => {
      const deleted = (changes?.deleted ?? []);
        // Restore deleted via the safe un-archive method
        deleted.reduce<Promise<void>>((p, annotation) => p.then(() => {
          return backend.restoreAnnotation(annotation);
        }), Promise.resolve());

        // TODO we'd need to trigger separate create/update actions 
        // on the backend here!
    }
    
    const onWinKeyDown = (evt: Event) => {
      const event = evt as KeyboardEvent;
      
      if (event.key === 'z' && event.ctrlKey)
        undo();
      else if (event.key === 'y' && event.ctrlKey)
        redo()
    };

    const onMacKeyDown = (evt: Event) => {
      const event = evt as KeyboardEvent;

      if (event.key === 'z' && event.metaKey) {
        if (event.shiftKey)
          redo()
        else
          undo();
      }
    }

    // TODO before undo/redo, inspect the next action. Silence if needed

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