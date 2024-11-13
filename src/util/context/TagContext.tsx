import { createTagDefinition, createTagsForTagDefinitions, getTagDefinitions } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import type { ToastContent } from '@components/Toast';
import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import type { TagDefinition } from 'src/Types';

interface TagContextType {
  loading: boolean;

  onSaveTagDefinition(name: string): Promise<void>;

  onSaveTags(tagDefinitionIds: string[], targetId: string): Promise<void>;

  tagDefinitions: TagDefinition[];
}

export const TagContext = createContext<TagContextType>({
  loading: false,
  onSaveTagDefinition: (name: string) => Promise.resolve(),
  onSaveTags: (tagDefinitionIds: string[], targetId: string) => Promise.resolve(),
  tagDefinitions: []
});

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

  const onSaveTags = useCallback((tagDefinitionIds: string[], targetId: string) => (
    createTagsForTagDefinitions(
      supabase,
      tagDefinitionIds,
      scope,
      scopeId,
      targetType,
      targetId
    ).then(loadTagDefinitions)
  ), []);

  const onSaveTagDefinition = useCallback((name) => (
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

  useEffect(() => {
    setLoading(true);

    loadTagDefinitions()
      .then(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    loading,
    onSaveTagDefinition,
    onSaveTags,
    setToast,
    tagDefinitions,
    toast
  }), [loading, onSaveTagDefinition, onSaveTags, setToast, tagDefinitions, toast]);

  return (
    <TagContext.Provider
      value={value}
    >
      { props.children }
    </TagContext.Provider>
  )
};