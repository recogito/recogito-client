import { useEffect, useState } from 'react';
import {
  addUsersToContext,
  createAssignmentContext,
  addDocumentsToContext,
  addReadOnlyLayersToContext,
} from '@backend/helpers';
import type { UserRole } from '@backend/Types';
import { supabase } from '@backend/supabaseBrowserClient';
import { Spinner } from '@components/Spinner';
import { AnimatedCheck } from '@components/AnimatedIcons';
import type { ProgressProps, ProgressState } from './Progress';

import './Progress.css';

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
          const docs: string[] = documents.map((d) => d.id);
          addDocumentsToContext(supabase, docs, context.id).then((result) => {
            if (!result) {
              console.error('Failed to add documents to context');

              setState('failed');
              props.onError('Failed to add documents to context');
            } else {
              // Step 3. For each layer, add users to the context
              const arr: UserRole[] = [];
              team.forEach((member) => {
                arr.push({ user_id: member.id, role: 'default' });
              });

              addUsersToContext(supabase, context.id, arr).then((result) => {
                if (!result) {
                  console.error('Failed to add users to context');
                  setState('failed');
                  props.onError('Failed to add users to context');
                } else {
                  // Step 4. Add any read only layers
                  const layers: string[] = [];
                  props.assignment.documents.forEach((doc) => {
                    doc.layers.forEach((layer) => {
                      if (layer.context!.id !== props.assignment.id) {
                        layers.push(layer.id);
                      }
                    });
                  });
                  if (layers.length > 0) {
                    addReadOnlyLayersToContext(
                      supabase,
                      context.id,
                      layers
                    ).then((result) => {
                      if (!result) {
                        console.error(
                          'Failed to add read only layers to context'
                        );
                        setState('failed');
                        props.onError(
                          'Failed to add read only layers to context'
                        );
                      } else {
                        setState('success');
                        props.onSaved({
                          ...props.assignment,
                          id: context.id,
                        });
                      }
                    });
                  } else {
                    setState('success');
                    props.onSaved({
                      ...props.assignment,
                      id: context.id,
                    });
                  }
                }
              });
            }
          });
        }
      }
    );
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
