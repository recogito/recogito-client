import { useEffect, useState } from 'react';
import {
  addUsersToContext,
  createAssignmentContext,
  addDocumentsToContext,
} from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { Spinner } from '@components/Spinner';
import { AnimatedCheck } from '@components/AnimatedIcons';
import type { ProgressProps, ProgressState } from './Progress';

import './Progress.css';
import type { userRole } from '@backend/Types';

export const ProgressCreating = (props: ProgressProps) => {
  const { t } = props.i18n;

  const { name, description, documents, team } = props.assignment;

  const [state, setState] = useState<ProgressState>('idle');

  useEffect(() => {
    const projectId = props.project.id;

    setState('creating_assignment');

    // Step 1. Create a new context for this assignment
    createAssignmentContext(supabase, name!, description, projectId).then(
      ({ error, data: context }) => {
        if (error) {
          console.error(error);

          setState('failed');
          props.onError(error.message);
        } else {
          // Step 2. Add documents to context
          const docs: string[] = documents.map(d => d.id);
          addDocumentsToContext(
            supabase,
            docs,
            context.id,
          )
            .then((result) => {
              if (!result) {
                console.error('Failed to add documents to context');

                setState('failed');
                props.onError('Failed to add documents to context');
              } else {
                // Step 3. For each layer, add users to the context
                const arr: userRole[] = [];
                team.forEach((member) => {
                  arr.push({ user_id: member.id, role: 'default' })
                });

                addUsersToContext(supabase, context.id, arr)
                  .then((result) => {
                    if (!result) {
                      console.error('Failed to add users to context');
                      setState('failed');
                      props.onError('Failed to add users to context');
                    } else {
                      setState('success');
                      props.onSaved(context);
                    }
                  })
              }
            })
        }
      });
  }, []);

  return (
    <div className='saving-assignment'>
      {state === 'idle' || state === 'creating_assignment' ? (
        <Spinner />
      ) : state === 'success' ? (
        <>
          <AnimatedCheck size={40} />
          <p>{t['The assignment was created successfully']}</p>
        </>
      ) : (
        <p>{t['Something went wrong']}</p>
      )}
    </div>
  );
};
