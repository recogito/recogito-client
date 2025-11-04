import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Img,
  Button,
} from '@react-email/components';

interface InviteUserEmailProps {
  acceptInviteLabel: string;
  acceptInviteUrl: string;
  helloMessage: string;
  host: string;
  welcomeMessage: string;
}

export const InviteUserEmail = ({
  acceptInviteLabel,
  acceptInviteUrl,
  helloMessage,
  host,
  welcomeMessage,
}: InviteUserEmailProps) => (
  <Html>
    <Head />
    <Body style={{ backgroundColor: '#b5c8dc', margin: 0, padding: 24 }}>
      <Container
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 8,
          fontFamily: 'sans-serif',
          color: '#242424',
          padding: 24,
        }}
      >
        <Img
          src={`http://${host}/img/branding/email/top-logo.png`}
          alt='RecogitoStudio'
          style={{ margin: '0 auto 16px', width: 300 }}
        />
        <Text style={{ marginBottom: 16 }}>{helloMessage}</Text>
        <Text style={{ marginBottom: 16 }}>{welcomeMessage}</Text>
        <Button
          href={acceptInviteUrl}
          style={{
            backgroundColor: '#07529a',
            color: '#ffffff',
            fontSize: 14,
            padding: '16px 24px',
            textDecoration: 'none',
            borderRadius: 4,
            display: 'block',
            margin: '0 auto',
            width: 'fit-content'
          }}
        >
          {acceptInviteLabel}
        </Button>
      </Container>
    </Body>
  </Html>
);
