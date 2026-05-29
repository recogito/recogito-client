import CustomFooter from '@branding/Footer';
import { RecogitoLogo } from '@components/RecogitoLogo';
import config from 'src/config.json';
import './BrandFooter.css';

const { bottom_logos_enabled: useFooter, contrast_color: textColor } =
  config.branding;

interface BrandFooterProps {
  poweredBy?: string;
  [key: string]: any;
}

export const BrandFooter = ({ poweredBy = 'powered by', ...rest }: BrandFooterProps) => (
  <footer className='brand-footer' {...rest}>
    {useFooter && (
      <div className='bottom-links'>
        <CustomFooter contrastColor={textColor} />
      </div>
    )}
    {!useFooter && (
      <div className='logo-container'>
        <span>{poweredBy}</span>
        <RecogitoLogo
          color='#FBBA00'
          contrastColor='white'
          height={42}
          width={230}
        />
      </div>
    )}
  </footer>
);