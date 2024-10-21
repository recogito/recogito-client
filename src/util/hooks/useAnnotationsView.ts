import { getHashParameter } from '@util/url';
import { useState } from 'react';
import { DocumentViewRight } from '../../Types.ts';

export const useAnnotationsView = () => {
  const rtab = getHashParameter('rtab');

  const defaultRightPanelOpen = !!(rtab && rtab !== DocumentViewRight.closed);
  const defaultRightPanelTab = rtab && rtab === DocumentViewRight.notes ? 'NOTES' : 'ANNOTATIONS';

  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(defaultRightPanelOpen);
  const [rightPanelTab, setRightPanelTab] = useState<'ANNOTATIONS' | 'NOTES'>(defaultRightPanelTab);

  return {
    rightPanelOpen,
    rightPanelTab,
    setRightPanelOpen,
    setRightPanelTab
  };
};