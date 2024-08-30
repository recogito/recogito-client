import CustomFooter from '@branding/Footer';
import { RecogitoLogo } from '@components/RecogitoLogo';
import config from 'src/config.json';
import type { Translations } from '../../Types';
import './BrandFooter.css';

const {
  bottom_logos_enabled: useFooter,
  contrast_color: textColor
} = config.branding;

interface Props {
  i18n: Translations;
}

export const BrandFooter = ({ i18n, ...rest }: Props) => {
  const { t } = i18n;

  return (
    <footer
      className='brand-footer'
      {...rest}
    >
      { useFooter && (
        <div
          className='bottom-links'
        >
          <CustomFooter
            contrastColor={textColor}
          />
        </div>
      )}
      { !useFooter && (
        <div
          className='logo-container'
        >
          <span>{t['powered by']}</span>
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