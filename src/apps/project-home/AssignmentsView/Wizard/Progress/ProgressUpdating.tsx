import { useEffect, useState } from 'react';
import { archiveContextDocuments } from '@backend/crud';
import { updateAssignmentContext, addDocumentsToContext, addUsersToContext, removeUsersFromContext } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { Spinner } from '@components/Spinner';
import { AnimatedCheck } from '@components/AnimatedIcons';
import type { ProgressProps, ProgressState } from './Progress';
import type { AssignmentSpec } from '../AssignmentSpec';
import type { userRole } from '@backend/Types';

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
};

export const ProgressUpdating = (props: ProgressUpdatingProps) => {
  const { t } = props.i18n;

  const { previous } = props;

  const { name, description, documents, team } = props.assignment;

  const [state, setState] = useState<ProgressState>('idle');

  const context: any = {
    id: previous.id!,
    name: name!,
    description,
    project_id: props.project.id,
    is_project_default: true
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
        const ids = documentChanges.removed.map(d => d.id);
        await archiveContextDocuments(supabase, ids, context.id);
      }

      // - check for added documents and create layers
      if (documentChanges.added.length > 0) {
        const docs: string[] = documentChanges.added.map(d => d.id);
        const resultAddDocs = await addDocumentsToContext(
          supabase,
          docs,
          context.id,
        )

        if (!resultAddDocs) {
          console.error('Failed to add documents to context');
          setState('failed');
          props.onError('Failed to add documents to context');
        }

      }

      // Step 3. Update users if necessary
      const memberChanges = diff(previous.team, team);

      // - Members were added
      if (memberChanges.added.length > 0) {

        const arr: userRole[] = [];
        memberChanges.added.forEach((member) => {
          arr.push({ user_id: member.id, role: 'default' })
        });

        const resultAddUsers = await addUsersToContext(supabase, context.id, arr);

        if (resultAddUsers) {
          setState('success');
          props.onSaved(props.assignment);
        } else {
          console.error('Failed to add users to context');
          setState('failed');
          props.onError('Failed to add users to context');
        }
      }

      // Members were removed (and some documents existed previously)
      if (memberChanges.removed.length > 0) {
        const arr: string[] = [];
        team.forEach((member) => {
          arr.push(member.id)
        });

        const resultRemoveUsers = await removeUsersFromContext(supabase, context.id, arr);

        if (resultRemoveUsers) {
          setState('success');
          props.onSaved(props.assignment);
        } else {
          console.error('Failed to remove users from context');
          setState('failed');
          props.onError('Failed to remove users from context');
        }
      }

      setState('success');
    };

    update()
      .then(() => props.onSaved(props.assignment))
      .catch((error) => {
        setState('failed');
        props.onError(error);
      });
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
