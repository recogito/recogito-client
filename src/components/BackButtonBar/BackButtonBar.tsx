import { useState } from 'react';
import { ArrowLeft, CaretRight } from '@phosphor-icons/react';
import { LoadingOverlay } from '@components/LoadingOverlay';

import './BackButtonBar.css';
import { useTranslation } from 'react-i18next';

interface BackButtonBarProps {

  showBackToProjects: boolean;

  crumbs?: { label: string, href: string | undefined }[];
}

export const BackButtonBar = (props: BackButtonBarProps) => {
  const [loading, setLoading] = useState(false);

  const { t, i18n } = useTranslation(['common']);

  return (
    <header className="back-button-bar-header">
      {loading && <LoadingOverlay />}
      {props.showBackToProjects ?
        <div className="back-button-bar-back" onClick={() => {
          setLoading(true);
          window.location.href = `/${i18n.language}/projects`;
        }}
        >
          <ArrowLeft size={18} />
          {t('Back to Projects', { ns: 'common' })}
        </div>

        :
        <div className="back-button-bar-crumbs">
          {props.crumbs?.map((crumb, idx) => {
            return (
              <div className="back-button-bar-crumb-container" key={idx}>
                <div className={crumb.href ? "back-button-bar-crumb-selectable" : "back-button-bar-crumb"} onClick={() => {
                  setLoading(true)
                  window.location.href = crumb.href as string;
                }}
                >
                  {crumb.label}
                </div>
                {idx < props.crumbs!.length - 1 &&
                  <div className="back-button-bar-right-carat">
                    <CaretRight size={18} />
                  </div>
                }
              </div>
            )
          })}
        </div>
      }
    </header >
  )
}