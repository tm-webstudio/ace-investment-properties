import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components';
import * as React from 'react';

export default function EmailLayout({ children, preview }) {
  return (
    <Html>
      <Head />
      {preview && <preview>{preview}</preview>}
      <Body style={main}>
        {/* Header */}
        <Section style={header}>
          <Container style={headerContainer}>
            <Text style={headerText}>ACE PROPERTIES</Text>
          </Container>
        </Section>

        {/* Content */}
        <Container style={container}>
          {children}
        </Container>

        {/* Footer */}
        <Section style={footer}>
          <Container style={footerContainer}>
            <Hr style={hr} />
            <Text style={footerText}>
              © 2026 Ace Investment Properties. All rights reserved.
            </Text>
            <Text style={footerLinks}>
              <Link href={`${process.env.NEXT_PUBLIC_SITE_URL}/help`} style={footerLink}>
                Help Center
              </Link>
              {' • '}
              <Link href={`${process.env.NEXT_PUBLIC_SITE_URL}/terms`} style={footerLink}>
                Terms
              </Link>
              {' • '}
              <Link href={`${process.env.NEXT_PUBLIC_SITE_URL}/privacy`} style={footerLink}>
                Privacy
              </Link>
            </Text>
            <Text style={footerContact}>
              Questions? Contact us at{' '}
              <Link href="mailto:support@aceinvestmentproperties.co.uk" style={footerLink}>
                support@aceinvestmentproperties.co.uk
              </Link>
            </Text>
          </Container>
        </Section>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: 'Arial, sans-serif',
};

const header = {
  backgroundColor: '#1a1a1a',
  padding: '20px 0',
};

const headerContainer = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '0 20px',
};

const headerText = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
  letterSpacing: '2px',
};

const container = {
  backgroundColor: '#ffffff',
  maxWidth: '600px',
  margin: '0 auto',
  padding: '40px 20px',
};

const footer = {
  backgroundColor: '#f5f5f5',
  padding: '20px 0',
};

const footerContainer = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '0 20px',
};

const hr = {
  borderColor: '#e5e5e5',
  margin: '20px 0',
};

const footerText = {
  color: '#666',
  fontSize: '12px',
  lineHeight: '20px',
  textAlign: 'center',
  margin: '10px 0',
};

const footerLinks = {
  color: '#666',
  fontSize: '12px',
  textAlign: 'center',
  margin: '10px 0',
};

const footerLink = {
  color: '#0066cc',
  textDecoration: 'none',
};

const footerContact = {
  color: '#666',
  fontSize: '12px',
  textAlign: 'center',
  margin: '10px 0',
};
