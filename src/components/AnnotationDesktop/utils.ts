import type { AnnotationBody, PresentUser, User } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { VocabularyTerm } from 'src/Types';

/** Determines the creator of the annotation by the target, or the first body **/
export const getCreator = (annotation: SupabaseAnnotation) =>
  annotation.target?.creator || 
    (annotation.bodies.length > 0 ? annotation.bodies[0].creator : undefined);

export const getContributors = (annotation: SupabaseAnnotation) => {
  const contributors: User[] = [
    annotation.target.creator!,
    ...annotation.bodies.map(b => b.creator!)
  ].filter(Boolean); // Remove undefined

  // De-duplicate
  return contributors.reduce<User[]>((unique, user) => (
    unique.some(u => u.id === user.id) ? unique : [...unique, user]
  ), []);
}

/** Returns an appropriate display name for the given (Present)User **/
export const getDisplayName = (user?: PresentUser | User) => {
  if (user) {
    return 'appearance' in user ? 
      (user as PresentUser).appearance.label : user.name || 'Anonymous';
  } else {
    return 'Anonymous';
  }
}

/** Determines the list of unique creators in the given annotation list **/
export const enumerateCreators = (present: PresentUser[], annotations: SupabaseAnnotation[], visibleLayers?: string[]) => {
  const layerIds = visibleLayers ? new Set(visibleLayers) : undefined;

  return annotations.reduce<User[]>((enumerated, a) => {
    // If there is a layer filter, ignore annotations outside of visible layers
    if (layerIds && a.layer_id && !layerIds.has(a.layer_id)) return enumerated;
    
    const presentCreator = present.find(p => p.id === a.target.creator?.id);
    if (presentCreator) {
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
}

export const enumerateContributors = (present: PresentUser[], annotations: SupabaseAnnotation[], visibleLayers?: string[]) => {
  const layerIds = visibleLayers ? new Set(visibleLayers) : undefined;

  const users = annotations.reduce<User[]>((enumerated, a) => {
    // If there is a layer filter, ignore annotations outside of visible layers
    if (layerIds && a.layer_id && !layerIds.has(a.layer_id)) return enumerated;

    const contributors: User[] = [
      a.target.creator!,
      ...a.bodies.map(b => b.creator!)
    ].filter(Boolean); // Remove undefined
    
    const next = [
      ...enumerated,
      ...contributors
    ].reduce<User[]>((unique, user) => ( // De-duplicate
      unique.some(u => u.id === user.id) ? unique : [...unique, user]
    ), []);

    return next;
  }, []);

  return users.map(u => {
    const presentUser = present.find(p => p.id === u.id);
    return presentUser ? presentUser : u
  });
}

/** Determines the list of unique tags in the given annotation list **/
export const enumerateTags = (annotations: SupabaseAnnotation[], visibleLayers?: string[]): VocabularyTerm[] => {
  const layerIds = visibleLayers ? new Set(visibleLayers) : undefined;

  return annotations.reduce<AnnotationBody[]>((enumerated, annotation) => {
    // If there is a layer filter, ignore annotations outside of visible layers
    if (layerIds && annotation.layer_id && !layerIds.has(annotation.layer_id)) return enumerated;
    
    const tags = annotation.bodies.filter(b => b.purpose === 'tagging');
    return [...enumerated, ...tags];
  }, [])
  .sort((a, b) => a.created! > b.created! ? 1 : -1)
  .reduce<VocabularyTerm[]>((firstOccurrences, body) => {
    if (body.value) {      
      // For backwards-compatibility: support object and string tags
      const tag: VocabularyTerm = body.value?.startsWith('{') ? JSON.parse(body.value) : { label: body.value };

      const key = tag.id || tag.label;
      const exists = firstOccurrences.some(t => (t.id || t.label) === key);

      return exists ? firstOccurrences : [...firstOccurrences, tag];
    } else {
      return firstOccurrences;
    }
  }, []);
}