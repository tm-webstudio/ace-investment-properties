import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Font,
} from '@react-email/components';
import * as React from 'react';

export default function EmailLayout({ children, preview }) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Playfair Display"
          fallbackFontFamily="Georgia"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={500}
          fontStyle="normal"
        />
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      {preview && <preview>{preview}</preview>}
      <Body style={main}>
        {/* Header */}
        <Section style={header}>
          <Container style={headerContainer}>
            <Text style={headerText}>ACE INVESTMENT PROPERTIES</Text>
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
  backgroundColor: '#f8f9fa',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: 0,
  padding: 0,
};

const header = {
  backgroundColor: '#1a1a2e',
  padding: '24px 0',
  textAlign: 'center',
};

const headerContainer = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '0 20px',
};

const headerText = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0',
  letterSpacing: '1px',
  textAlign: 'center',
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
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '20px',
  textAlign: 'center',
  margin: '10px 0',
};

const footerLinks = {
  color: '#6b7280',
  fontSize: '12px',
  textAlign: 'center',
  margin: '10px 0',
};

const footerLink = {
  color: '#4169E1',
  textDecoration: 'none',
};

const footerContact = {
  color: '#6b7280',
  fontSize: '12px',
  textAlign: 'center',
  margin: '10px 0',
};
