import type { Translations } from "src/Types"
import { ArrowLeft } from "@phosphor-icons/react";

import './BackButtonBar.css';

interface BackButtonBarProps {
  i18n: Translations;
}

export const BackButtonBar = (props: BackButtonBarProps) => (
  <header className="back-button-bar-header">
    <a href={`/${props.i18n.lang}/projects`}>
      <ArrowLeft />
      {props.i18n.t['Back to Projects']}
    </a>
  </header >
)