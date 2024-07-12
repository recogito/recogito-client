import type { DocumentLayer } from 'src/Types';

// A temporary helper
export const deduplicateLayers = (layers: DocumentLayer[]) =>
  layers.reduce<DocumentLayer[]>((distinct, layer) => {
    const existing = distinct.find(l => l.id === layer.id);
    return existing ? distinct : [...distinct, layer];
  }, []);
