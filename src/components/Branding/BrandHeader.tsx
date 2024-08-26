import config from 'src/config.json';
import './BrandHeader.css';

export const BrandHeader = (props) => {
  const { site_name: siteName } = config.branding;

  return (
    <header
      className='brand-header'
      {...props}
    >
      <div
        className='brand-header-container'
      >
        <img
          height={40}
          src='/img/branding/login/header-logo.svg'
        />
        <div className='separator'></div>
        <div className='site-name'>{siteName}</div>
      </div>
    </header>
  );
};