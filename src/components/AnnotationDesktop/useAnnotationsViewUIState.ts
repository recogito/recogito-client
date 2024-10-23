import { buildURL, getHashParameter, getHashParameters, getSearchParameters } from '@util/url';
import { useEffect, useMemo, useState } from 'react';
import { DocumentViewRight } from '../../Types.ts';

export const useAnnotationsViewUIState = () => {
  const rtab = getHashParameter('rtab');

  const defaultRightPanelOpen = !!(rtab && rtab !== DocumentViewRight.closed);
  const defaultRightPanelTab = rtab && rtab === DocumentViewRight.notes ? 'NOTES' : 'ANNOTATIONS';

  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(defaultRightPanelOpen);
  const [rightPanelTab, setRightPanelTab] = useState<'ANNOTATIONS' | 'NOTES'>(defaultRightPanelTab);

  /**
   * Sets whether the annotations popup should display.
   */
  const usePopup = useMemo(() => !(rightPanelOpen && rightPanelTab === 'ANNOTATIONS'), [rightPanelOpen, rightPanelTab]);

  /**
   * Synchronizes the right panel open and tab selection with the URL.
   */
  useEffect(() => {
    let newRightTab = DocumentViewRight.closed;

    if (rightPanelOpen) {
      if (rightPanelTab === 'ANNOTATIONS') {
        newRightTab = DocumentViewRight.annotations;
      } else if (rightPanelTab === 'NOTES') {
        newRightTab = DocumentViewRight.notes;
      }
    }

    const search = getSearchParameters();
    const hash = getHashParameters();
    hash.set('rtab', newRightTab);

    const nextURL = buildURL(window.location.pathname, search, hash);
    window.history.pushState({ rtab: newRightTab }, '', nextURL);

  }, [rightPanelOpen, rightPanelTab]);

  return {
    rightPanelOpen,
    rightPanelTab,
    setRightPanelOpen,
    setRightPanelTab,
    usePopup
  };
};