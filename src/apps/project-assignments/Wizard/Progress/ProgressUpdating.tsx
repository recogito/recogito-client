import { useEffect, useState } from 'react';
import { archiveLayer } from '@backend/crud';
import { addUsersToLayer, createLayerInContext, removeUsersFromLayer, updateAssignmentContext } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { Spinner } from '@components/Spinner';
import { AnimatedCheck } from '@components/AnimatedIcons';
import type { Context, Layer } from 'src/Types';
import type { ProgressProps, ProgressState } from './Progress';
import type { AssignmentSpec } from '../AssignmentSpec';

import './Progress.css';

interface ProgressUpdatingProps extends ProgressProps {

  previous: AssignmentSpec;

}

/**
 * Helper to determine which items in ys were added and removed, compared to xs.
 */
const diff = <T extends { id: string }>(xs: T[], ys: T[]): { added: T[], removed: T[], unchanged: T[] } => {
  const added = [];
  const removed = [];
  const unchanged = [];

  const xsIdSet = new Set(xs.map(item => item.id));
  const ysIdSet = new Set(ys.map(item => item.id));

  for (const item of xs) {
    if (ysIdSet.has(item.id)) {
      // Item is in both arrays - unchanged
      unchanged.push(item);
    } else {
      // Item is in the first array but not in the second - removed
      removed.push(item);
    }
  }

  for (const item of ys) {
    if (!xsIdSet.has(item.id)) {
      // Item is in the second array but not in the first - added
      added.push(item);
    }
  }

  return { added, removed, unchanged };
}

export const ProgressUpdating = (props: ProgressUpdatingProps) => {

  const { t } = props.i18n;

  const { previous } = props;

  const { name, description, documents, team } = props.assignment;

  const [state, setState] = useState<ProgressState>('idle');

  const context: Context = {
    id:  previous.id!,
    name: name!,
    description,
    project_id: props.project.id
  };
  
  useEffect(() => {
    setState('updating_assignment');

    const update = async () => {
      // Step 1. Update name/description if needed.
      if (name !== previous.name || description !== previous.description)
        await updateAssignmentContext(supabase, context.id, name!, description);
    
      // Step 2. Update documents.
      const documentChanges = diff(previous.documents, documents);

      // - check for removed documents and delete their layers
      if (documentChanges.removed.length > 0) {
        await documentChanges.removed.reduce((promise, document) => {
          return promise.then(() => {
            return archiveLayer(supabase, document.layers[0].id);
          });
        }, Promise.resolve<void>(undefined));
      }

      // - check for added documents and create layers
      if (documentChanges.added.length > 0) {
        const layers = await documentChanges.added.reduce((promise, document) => {
          return promise.then(layers => {
            return createLayerInContext(supabase, document.id, context.project_id, context.id)
              .then(layer => ([...layers, layer]))
          });
        }, Promise.resolve<Layer[]>([]));

        // - for each created layer, add members to the 'Layer Student' group
        await layers.reduce((promise, layer) => {
          return promise.then(() => 
              addUsersToLayer(supabase, layer.id, 'Layer Student', team));
        }, Promise.resolve<void>(undefined));
      }

      // Step 3. Update users if necessary
      const memberChanges = diff(previous.team, team);

      // IDs of the layers on the existing documents
      const existingLayerIds = documentChanges.unchanged.map(d => d.layers[0].id)

      // - Members were added (and some documents existed previously)
      if (memberChanges.added.length > 0 && documentChanges.unchanged.length > 0) {
        await existingLayerIds.reduce((promise, layerId) => {
          // - insert added users to its 'Layer Student' group
          return promise.then(() => 
              addUsersToLayer(supabase, layerId, 'Layer Student', memberChanges.added));
        }, Promise.resolve<void>(undefined));
      }

      // Members were removed (and some documents existed previously)
      if (memberChanges.removed.length > 0 && documentChanges.unchanged.length > 0) {
        await existingLayerIds.reduce((promise, layerId) => {
          return promise.then(() =>
            removeUsersFromLayer(supabase, layerId, 'Layer Student', memberChanges.removed));
        }, Promise.resolve<void>(undefined));
      }

      setState('success');
    }

    update()
      .then(() => props.onSaved(context))
      .catch(error => { 
        setState('failed');
        props.onError(error)
      });
  }, []);

  return (
    <div className="saving-assignment">
      {state === 'idle' || state === 'updating_assignment' ? (
        <Spinner />
      ) : state === 'success' ? (
        <>
          <AnimatedCheck size={40} />
          <p>
            {t['The assignment was updated successfully']}
          </p>
        </>
      ) : (
        <p>{t['Something went wrong']}</p>
      )}
    </div>
  )

}