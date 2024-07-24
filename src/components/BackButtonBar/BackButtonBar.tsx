import { useState } from 'react';
import { ArrowLeft, CaretRight } from '@phosphor-icons/react';
import { LoadingOverlay } from '@components/LoadingOverlay';
import type { Translations } from 'src/Types';

import './BackButtonBar.css';

interface BackButtonBarProps {
  i18n: Translations;

  showBackToProjects: boolean;

  crumbs?: { label: string, href: string | undefined }[];
}

export const BackButtonBar = (props: BackButtonBarProps) => {
  const [loading, setLoading] = useState(false);

  return (
    <header className="back-button-bar-header">
      {loading && <LoadingOverlay />}
      {props.showBackToProjects ?
        <div className="back-button-bar-back" onClick={() => {
          setLoading(true);
          window.location.href = `/${props.i18n.lang}/projects`;
        }}
        >
          <ArrowLeft size={18} />
          {props.i18n.t['Back to Projects']}
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