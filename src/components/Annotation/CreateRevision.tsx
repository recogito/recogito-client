

import { PencilLine } from '@phosphor-icons/react';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import { Origin, useAnnotator, type AnnotoriousOpenSeadragonAnnotator, type ImageAnnotation, type ImageAnnotationTarget, type PresentUser, type User } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { Layer } from 'src/Types';

import './CreateRevision.css';
import { useMemo } from 'react';

const SUPABASE_URL: string = import.meta.env.PUBLIC_SUPABASE;

/**
 * Generates a stable UUID from any string, using UUID v5.
 * - First, generates a "namespace UUID", unique to this Recogito Studio instance.
 * - Next, generates a UUID from the namespace and the string.
 */
const uuidFromString = (str: string) => {
  // The pre-defined namespace for UUIDs supposed to represent a URL.
  // Cf. https://www.rfc-editor.org/rfc/rfc4122.html
  const NAMESPACE_URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

  const namespace = uuidv5(SUPABASE_URL, NAMESPACE_URL);
  return uuidv5(str, namespace);
}

interface CreateRevisionProps {

  annotation: SupabaseAnnotation;

  layers?: Layer[];

  me: PresentUser | User;

}

export const CreateRevision = (props: CreateRevisionProps) => {

  const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

  const activeLayer = useMemo(() => {
    if (!props.layers) return;

    const active = props.layers.find(l => l.is_active);
    return active?.id;
  }, [props.layers]);

  const onCloneToActiveLayer = () => {
    // Should never happen
    if (!activeLayer) return;

    const selected = anno.getSelected();

    // Should never happen
    if (selected.length !== 1) return;

    const { id: origId, bodies, target } = selected[0] as SupabaseAnnotation;

    // TODO temporary hack
    const id = uuidv4(); // uuidFromString(origId);

    // Changes needed:
    // - Set layer_id to active layer
    // - Set target to my user

    const clone = {
      id,
      via: origId,
      layer_id: activeLayer,
      bodies: bodies.map(b => ({
        ...b,
        id: uuidv4(),
        annotation: id,
        updated: new Date(),
        updatedBy: props.me
      })),
      target: {
        ...target,
        creator: props.me,
        created: new Date()
      } as ImageAnnotationTarget
    };
    anno.cancelSelected();

    console.log(clone, selected[0]);

    anno.state.store.deleteAnnotation(origId, Origin.REMOTE);
    anno.state.store.addAnnotation(clone as ImageAnnotation);

    anno.setSelected(id);
  }

  return (
    <div className="create-revision">
      <button onClick={onCloneToActiveLayer}>
        <PencilLine size={18} /> Create Editable Revision
      </button>
    </div>
  )

}