import COVESingleColor from './COVESingleColor';
import NEH from './NEH';

interface FooterProps {
  contrastColor: string;
}
const Footer = (props: FooterProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <COVESingleColor contrastColor={props.contrastColor} />
      <div style={{ paddingLeft: 5 }}>
        <NEH contrastColor={props.contrastColor} href='https://www.neh.gov/' />
      </div>
    </div>
  );
};

export default Footer;
