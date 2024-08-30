import config from 'src/config.json';
import './BrandHeader.css';

const { site_name: siteName, top_logo: topLogo } = config.branding;
const imageUrl = `/img/${topLogo || 'recogito-studio-logo.svg'}`;

export const BrandHeader = (props) => (
  <header
    className='brand-header'
    {...props}
  >
    <div
      className='brand-header-container'
    >
      <img
        height={40}
        src={imageUrl}
      />
      <div className='separator'></div>
      <div className='site-name'>{siteName}</div>
    </div>
  </header>
);