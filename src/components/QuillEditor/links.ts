import Quill from 'quill';
import { isAnnotationLink, linkIsCurrentPane } from './utils';
import { useAnnotator } from '@annotorious/react';
import type { RecogitoTextAnnotator } from '@recogito/react-text-annotator';

const Link: any = Quill.import('formats/link');

export default class PatchedLink extends Link {
  static create(value: string) {
    let node;
    if (isAnnotationLink(value)) {
      if (linkIsCurrentPane(value)) {
        node = super.create(value);
        const url = new URL(value);

        node.removeAttribute('href');
        node.setAttribute(
          'href',
          'javascript:function doThis(ev: any) {ev.preventDefault();const { scrollIntoView } = useAnnotator<RecogitoTextAnnotator>();scrollIntoView(url.hash);};'
        );
        node.setAttribute('target', '_self');
        node.setAttribute('onclick', function doThis(ev: any) {
          ev.preventDefault();
          const { scrollIntoView } = useAnnotator<RecogitoTextAnnotator>();
          scrollIntoView(url.hash);
        });
      } else {
        node = super.create(value);
        node.setAttribute('target', '_blank');
      }
    } else {
      node = super.create(value);
      node.setAttribute('target', '_blank');
    }

    return node;
  }
}
