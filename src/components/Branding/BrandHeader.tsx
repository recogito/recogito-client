import CustomHeader from '@branding/Header';
import config from 'src/config.json';

import './Branding.css';

export const BrandHeader = () => {

  const { 
    contrast_color,
    platform_name, 
    site_name,
    top_logos_enabled
  } = config.branding;

  return (
    <header className="branding">
      <div className="branding-left-slot">
        <div className="branding-platform">
          {platform_name}
        </div>
        <div className="branding-separator"></div>
        <div className="branding-site-name">{site_name}</div>
      </div>
      <div className="branding-right-slot">
        {top_logos_enabled && <CustomHeader contrastColor={contrast_color} />}
      </div>
    </header>
  )

}