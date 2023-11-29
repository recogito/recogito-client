import Test from './Test';

interface FooterProps {
  contrastColor: string;
}

const Footer = (props: FooterProps) => {
  return (
    <div style={{ flexDirection: 'row' }}>
      <Test contrastColor={props.contrastColor} />
    </div>
  );
};

export default Footer;
