import { FilterPanel } from '@components/AnnotationDesktop/FilterPanel';
import './LeftDrawer.css';
import type { Translations } from 'src/Types';

interface LeftDrawerProps {

  i18n: Translations;

  open: boolean;

}

export const LeftDrawer = (props: LeftDrawerProps) => {

  return (
    <div className={props.open ? 'ta-drawer ta-left-drawer open' : 'ta-drawer ta-left-drawer'}>
      <aside>
        {props.open && ( 
          <FilterPanel i18n={props.i18n} />
        )}
      </aside>
    </div>
  )

}