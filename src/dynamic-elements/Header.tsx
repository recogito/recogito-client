import NAVSA from './NAVSA';

interface HeaderProps {
  contrastColor: string;
}

const Header = (props: HeaderProps) => {
  const textStyle = {
    fontSize: 20,
    color: props.contrastColor,
  };

  const Divider = () => {
    return (
      <div
        style={{
          height: 25,
          width: 2,
          backgroundColor: props.contrastColor,
          marginLeft: 3,
          marginRight: 3,
        }}
      />
    );
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
    >
      <NAVSA contrastColor={props.contrastColor} href='https://navsa.org/' />
      <div style={{ ...textStyle, paddingLeft: 3 }}>
        <a href='https://navsa.org/' style={{ color: props.contrastColor }}>
          NAVSA
        </a>
      </div>
      <Divider />
      <div style={textStyle}>
        <a href='https://bavs.ac.uk/' style={{ color: props.contrastColor }}>
          BAVS
        </a>
      </div>
      <Divider />
      <div style={textStyle}>
        <a href='https://avsa.net.au/' style={{ color: props.contrastColor }}>
          AVSA
        </a>
      </div>
      <Divider />
      <div style={textStyle}>
        <a href='https://www.nassr.ca/' style={{ color: props.contrastColor }}>
          NASSR
        </a>
      </div>
    </div>
  );
};

export default Header;
