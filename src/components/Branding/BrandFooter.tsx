import CustomFooter from '@branding/Footer';
import config from 'src/config.json';

import './Branding.css';

export const BrandFooter = () => {

  const { 
    bottom_logos_enabled, 
    contrast_color, 
    footer_message } = config.branding;

  return (
    <footer className="branding">
      <div className="branding-blurb">
        {footer_message || ''}
      </div>
      <div className="branding-right-slot">
        {bottom_logos_enabled && <CustomFooter contrastColor={contrast_color} />}
      </div>
    </footer>
  )

}