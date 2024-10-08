import { useEffect, useState } from 'react';
import { archiveContextDocuments } from '@backend/crud';
import {
  updateAssignmentContext,
  addDocumentsToContext,
  addUsersToContext,
  removeUsersFromContext,
  addReadOnlyLayersToContext,
  removeReadOnlyLayersFromContext,
} from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { Spinner } from '@components/Spinner';
import { AnimatedCheck } from '@components/AnimatedIcons';
import type { ProgressProps, ProgressState } from './Progress';
import type { AssignmentSpec } from '../AssignmentSpec';
import type { UserRole } from '@backend/Types';

import './Progress.css';

interface ProgressUpdatingProps extends ProgressProps {
  previous: AssignmentSpec;
}

/**
 * Helper to determine which items in ys were added and removed, compared to xs.
 */
const diff = <T extends { id: string }>(
  xs: T[],
  ys: T[]
): { added: T[]; removed: T[]; unchanged: T[] } => {
  const added = [];
  const removed = [];
  const unchanged = [];

  const xsIdSet = new Set(xs.map((item) => item.id));
  const ysIdSet = new Set(ys.map((item) => item.id));

  for (const item of xs) {
    if (!ysIdSet.has(item.id)) {
      // Item is in the first array but not in the second - removed
      removed.push(item);
    }
  }

  for (const item of ys) {
    if (xsIdSet.has(item.id)) {
      // Item is in both arrays - unchanged
      unchanged.push(item);
    } else {
      // Item is in the second array but not in the first - added
      added.push(item);
    }
  }

  return { added, removed, unchanged };
};

export const ProgressUpdating = (props: ProgressUpdatingProps) => {
  const { t } = props.i18n;

  const { previous } = props;

  const { name, description, documents, team, id } = props.assignment;

  const [state, setState] = useState<ProgressState>('updating_assignment');

  const context: any = {
    id: previous.id!,
    name: name!,
    description,
    project_id: props.project.id,
    is_project_default: true,
  };

  useEffect(() => {
    const update = async () => {
      // Step 1. Update name/description if needed.
      if (name !== previous.name || description !== previous.description)
        await updateAssignmentContext(supabase, context.id, name!, description);

      // Step 2. Update documents.
      const documentChanges = diff(previous.documents, documents);

      // - check for removed documents and delete their layers
      if (documentChanges.removed.length > 0) {
        const ids = documentChanges.removed.map((d) => d.id);
        await archiveContextDocuments(supabase, ids, context.id);
      }

      // - check for added documents and create layers
      if (documentChanges.added.length > 0) {
        const docs: string[] = documentChanges.added.map((d) => d.id);
        const resultAddDocs = await addDocumentsToContext(
          supabase,
          docs,
          context.id
        );

        if (!resultAddDocs) {
          setState('failed');
          props.onError('Failed to add documents to context');
        }

        // - check for added read only layers on new documents
        for (let i = 0; i < documentChanges.added.length; i++) {
          const doc = documentChanges.added[i];
          if (doc.layers.length > 0) {
            // Look for added layers
            const readOnlyLayers: string[] = [];
            for (let i = 0; i < doc.layers.length; i++) {
              readOnlyLayers.push(doc.layers[i].id);
            }
            doc.layers.forEach((layer) => {
              if (!layer.is_active) {
                readOnlyLayers.push(layer.id);
              }
            });

            if (readOnlyLayers.length > 0) {
              // console.log('Adding Read-Only Layers: ', readOnlyLayers);
              const resultROLayers = await addReadOnlyLayersToContext(
                supabase,
                id as string,
                readOnlyLayers
              );
              if (!resultROLayers) {
                props.onError(
                  'Failed to add document read only layers to context'
                );
              }
            }
          }
        }
      }

      // Step 3 - check for added read only layers documents
      for (let i = 0; i < documentChanges.unchanged.length; i++) {
        const doc = documentChanges.unchanged[i];
        const prevDoc = previous.documents.find((d) => d.id === doc.id);

        const layerDiff = diff(prevDoc!.layers, doc.layers);
        if (layerDiff.added.length > 0) {
          // Look for added layers
          const readOnlyLayers: string[] = [];
          for (let i = 0; i < layerDiff.added.length; i++) {
            readOnlyLayers.push(layerDiff.added[i].id);
          }
          if (readOnlyLayers.length > 0) {
            // console.log('Adding Read-Only Layers: ', readOnlyLayers);
            const resultROLayers = await addReadOnlyLayersToContext(
              supabase,
              id as string,
              readOnlyLayers
            );
            if (!resultROLayers.data) {
              setState('failed');
              props.onError(
                'Failed to add document read only layers to context'
              );
            }
          }
        }
        if (layerDiff.removed.length > 0) {
          //  Now look for removed layers
          const removeReadOnlyLayers: string[] = [];
          for (let i = 0; i < layerDiff.removed.length; i++) {
            removeReadOnlyLayers.push(layerDiff.removed[i].id);
          }

          if (removeReadOnlyLayers.length > 0) {
            // console.log('Removing Read-Only Layers: ', removeReadOnlyLayers);
            const resultROLayers = await removeReadOnlyLayersFromContext(
              supabase,
              id as string,
              removeReadOnlyLayers
            );
            if (!resultROLayers.data) {
              setState('failed');
              props.onError(
                'Failed to remove document read only layers to context'
              );
            }
          }
        }
      }

      // Step 4. Update users if necessary
      const memberChanges = diff(previous.team, team);

      // - Members were added
      if (memberChanges.added.length > 0) {
        const arr: UserRole[] = [];
        memberChanges.added.forEach((member) => {
          arr.push({ user_id: member.id, role: 'default' });
        });

        const resultAddUsers = await addUsersToContext(
          supabase,
          context.id,
          arr
        );

        if (resultAddUsers) {
          setState('success');
          props.onSaved(props.assignment);
        } else {
          setState('failed');
          props.onError('Failed to add users to context');
        }
      }

      // Members were removed (and some documents existed previously)
      if (memberChanges.removed.length > 0) {
        const arr: string[] = [];
        memberChanges.removed.forEach((member) => {
          arr.push(member.id);
        });

        const resultRemoveUsers = await removeUsersFromContext(
          supabase,
          context.id,
          arr
        );

        if (resultRemoveUsers) {
          setState('success');
          props.onSaved(props.assignment);
        } else {
          setState('failed');
          props.onError('Failed to remove users from context');
        }
      }

      setState('success');
    };

    if (state === 'updating_assignment') {
      update()
        .then(() => props.onSaved(props.assignment))
        .catch((error) => {
          setState('failed');
          props.onError(error);
        });
    }
  }, []);

  return (
    <div className='saving-assignment'>
      {state === 'idle' || state === 'updating_assignment' ? (
        <Spinner />
      ) : state === 'success' ? (
        <>
          <AnimatedCheck size={40} />
          <p>{t['The assignment was updated successfully']}</p>
        </>
      ) : (
        <p>{t['Something went wrong']}</p>
      )}
    </div>
  );
};
