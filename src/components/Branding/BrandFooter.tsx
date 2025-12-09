import CustomFooter from '@branding/Footer';
import { RecogitoLogo } from '@components/RecogitoLogo';
import config from 'src/config.json';
import { useTranslation } from 'react-i18next';
import './BrandFooter.css';

const { bottom_logos_enabled: useFooter, contrast_color: textColor } =
  config.branding;

export const BrandFooter = ({ ...rest }) => {
  const { t } = useTranslation(['branding']);

  return (
    <footer className='brand-footer' {...rest}>
      {useFooter && (
        <div className='bottom-links'>
          <CustomFooter contrastColor={textColor} />
        </div>
      )}
      {!useFooter && (
        <div className='logo-container'>
          <span>{t('powered by', { ns: 'branding' })}</span>
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
};
