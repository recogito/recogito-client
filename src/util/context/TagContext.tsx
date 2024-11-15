import { createTagDefinition, deleteTagDefinition, updateTagDefinition } from '@backend/crud';
import { createTagsForTagDefinitions, createTagsForTargets, getTagDefinitions } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import type { ToastContent } from '@components/Toast';
import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import type { TagDefinition } from 'src/Types';

interface TagContextType {
  loading: boolean;

  loadTagDefinitions(): Promise<void>;

  onCreateTagDefinition(name: string): Promise<TagDefinition>;

  onDeleteTagDefinition(id: string): Promise<void>;

  onSaveTagsForTagDefinitions(tagDefinitionIds: string[], targetId: string): Promise<void>;

  onSaveTagsForTargets(tagDefinitionId: string, targetIds: string[]): Promise<void>;

  onUpdateTagDefinition(id: string, name: string): Promise<TagDefinition>;

  setToast(toast: ToastContent | null): void;

  tagDefinitions: TagDefinition[];

  toast: ToastContent | null;
}

export const TagContext = createContext<TagContextType>({} as TagContextType);

interface Props {
  children: ReactNode,
  scope: string,
  scopeId: string,
  targetType: string
}

export const TagContextProvider = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [tagDefinitions, setTagDefinitions] = useState<TagDefinition[]>([]);
  const [toast, setToast] = useState<ToastContent | null>(null);

  const { scope, scopeId, targetType } = props;

  const loadTagDefinitions = useCallback(() => (
    getTagDefinitions(supabase, scope, scopeId, targetType)
      .then(({ data }) => setTagDefinitions(data))
  ), []);

  const onCreateTagDefinition = useCallback((name) => (
    createTagDefinition(supabase, {
      name,
      scope: scope,
      scope_id: scopeId,
      target_type: targetType
    })
      .then((tagDefinition: TagDefinition) => (
        setTagDefinitions((prevTagDefinitions) => [tagDefinition, ...prevTagDefinitions]))
      )
  ), []);

  const onDeleteTagDefinition = useCallback((id) => (
    deleteTagDefinition(supabase, id)
      .then(() => setTagDefinitions((prevTagDefinitions) => (
        prevTagDefinitions.filter((tagDefinition) => tagDefinition.id !== id)
      )))
  ), []);

  const onSaveTagsForTagDefinitions = useCallback((tagDefinitionIds: string[], targetId: string) => (
    createTagsForTagDefinitions(supabase, tagDefinitionIds, scope, scopeId, targetType, targetId)
      .then(() => setLoading(true))
      .then(loadTagDefinitions)
      .finally(() => setLoading(false))
  ), [loadTagDefinitions]);

  const onSaveTagsForTargets = useCallback((tagDefinitionId: string, targetIds: string[]) => (
    createTagsForTargets(supabase, tagDefinitionId, targetIds)
      .then(() => setLoading(true))
      .then(loadTagDefinitions)
      .finally(() => setLoading(false))
  ), []);

  const onUpdateTagDefinition = useCallback((id, name) => (
    updateTagDefinition(supabase, id, name)
      .then((tagDefinition: TagDefinition) => (
        setTagDefinitions((prevTagDefinitions) => (
          prevTagDefinitions.map((t) => t.id === tagDefinition.id ? tagDefinition : t))
        )
      ))
  ), []);

  useEffect(() => {
    setLoading(true);

    loadTagDefinitions()
      .then(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    loading,
    loadTagDefinitions,
    onCreateTagDefinition,
    onDeleteTagDefinition,
    onSaveTagsForTagDefinitions,
    onSaveTagsForTargets,
    onUpdateTagDefinition,
    setToast,
    tagDefinitions,
    toast
  }), [
    loading,
    loadTagDefinitions,
    onCreateTagDefinition,
    onDeleteTagDefinition,
    onSaveTagsForTagDefinitions,
    onSaveTagsForTargets,
    onUpdateTagDefinition,
    setToast,
    tagDefinitions,
    toast
  ]);

  return (
    <TagContext.Provider
      value={value}
    >
      { props.children }
    </TagContext.Provider>
  )
};