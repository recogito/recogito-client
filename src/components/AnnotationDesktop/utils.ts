import type { AnnotationBody, PresentUser, User } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';

/** Determines the creator of the annotation by the target, or the first body **/
export const getCreator = (annotation: SupabaseAnnotation) =>
  annotation.target?.creator || 
    (annotation.bodies.length > 0 ? annotation.bodies[0].creator : undefined);

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
}

/** Determines the list of unique tags in the given annotation list **/
export const enumerateTags = (annotations: SupabaseAnnotation[], visibleLayers?: string[]) => {
  const layerIds = visibleLayers ? new Set(visibleLayers) : undefined;

  return annotations.reduce<AnnotationBody[]>((enumerated, annotation) => {
    // If there is a layer filter, ignore annotations outside of visible layers
    if (layerIds && annotation.layer_id && !layerIds.has(annotation.layer_id)) return enumerated;
    
    const tags = annotation.bodies.filter(b => b.purpose === 'tagging');
    return [...enumerated, ...tags];
  }, [])
  .sort((a, b) => a.created! > b.created! ? 1 : -1)
  .reduce((firstOccurrences, body) => {
    if (body.value) {
      return firstOccurrences.indexOf(body.value) < 0 ? [...firstOccurrences, body.value] : firstOccurrences;
    } else {
      return firstOccurrences;
    }
  }, [] as string[]);
}