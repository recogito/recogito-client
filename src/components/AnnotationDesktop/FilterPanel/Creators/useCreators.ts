import { useMemo } from 'react';
import { PresentUser, User, useAnnotations } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';

export const enumerateCreators = (present: PresentUser[], annotations: SupabaseAnnotation[]) =>
  annotations.reduce<User[]>((enumerated, a) => {
    const presentCreator = present.find(p => p.id === a.target.creator?.id);
    if (presentCreator) {
      const exists = enumerated.find(u => u.id === presentCreator.id);
      return exists ? enumerated : [...enumerated, presentCreator];
    } else {
      const { creator } = a.target;
      if (creator) {
        const exists = enumerated.find(u => u.id === creator.id);
        return exists ? enumerated : [...enumerated, creator];
      } else {
        return enumerated;
      }
    }
  }, []);

export const useCreators = (present: PresentUser[]) => {

  const annotations = useAnnotations(250);

  const creators = useMemo(() => (
    enumerateCreators(present, annotations)
  ), [present, annotations]);

  return creators;

}