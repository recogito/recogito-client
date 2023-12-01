import Test from './Test';

interface HeaderProps {
  contrastColor: string;
}
const Header = (props: HeaderProps) => {
  return (
    <div style={{ flexDirection: 'row' }}>
      <Test contrastColor={props.contrastColor} />
    </div>
  );
};

export default Header;
