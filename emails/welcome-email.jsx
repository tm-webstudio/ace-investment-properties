import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

export default function WelcomeEmail({ name = 'there' }) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Ace Investment Properties</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to Ace Investment Properties</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            Thank you for joining Ace Investment Properties. We're excited to help you find your perfect property investment.
          </Text>
          <Text style={text}>
            You can now access your dashboard to:
          </Text>
          <ul>
            <li>Browse available properties</li>
            <li>Set your investment preferences</li>
            <li>Schedule property viewings</li>
            <li>Track your saved properties</li>
          </ul>
          <Link href={`${process.env.NEXT_PUBLIC_SITE_URL}/investor/dashboard`} style={button}>
            Go to Dashboard
          </Link>
          <Text style={text}>
            If you have any questions, feel free to reach out to our team.
          </Text>
          <Text style={footer}>
            Best regards,<br />
            The Ace Properties Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 20px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 20px',
};

const button = {
  backgroundColor: '#000',
  borderRadius: '5px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  padding: '12px 20px',
  margin: '20px',
};

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 20px',
  marginTop: '40px',
};
