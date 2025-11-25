import {
  Heading,
  Text,
  Section,
  Button,
  Hr,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

export default function MagicLink({
  email = 'user@example.com',
  magicLinkUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?token=abc123`,
}) {
  return (
    <EmailLayout preview="Your login link">
      {/* Icon + Title */}
      <Section style={titleSection}>
        <Text style={icon}>🔑</Text>
        <Heading style={heading}>Your Login Link</Heading>
        <Text style={subtitle}>
          Click the button below to sign in to your Ace Investment Properties account.
        </Text>
      </Section>

      {/* Info Box */}
      <Section style={infoBox}>
        <table style={infoTable}>
          <tbody>
            <tr>
              <td style={infoLabel}>Email:</td>
              <td style={infoValue}>{email}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* Sign In Button */}
      <Section style={buttonSection}>
        <Button href={magicLinkUrl} style={signInButton}>
          Sign In to Your Account
        </Button>
      </Section>

      <Hr style={hr} />

      {/* Security Info */}
      <Section style={securityBox}>
        <Heading as="h3" style={securityHeading}>
          🔒 Security Notice
        </Heading>
        <Text style={securityText}>
          • This link will expire in 15 minutes
        </Text>
        <Text style={securityText}>
          • This link can only be used once
        </Text>
        <Text style={securityText}>
          • Never share this link with anyone
        </Text>
        <Text style={securityText}>
          • If you didn't request this login link, please ignore this email
        </Text>
      </Section>

      {/* Alternative Link */}
      <Section style={alternativeBox}>
        <Heading as="h3" style={alternativeHeading}>
          Button not working?
        </Heading>
        <Text style={alternativeText}>
          Copy and paste this link into your browser:
        </Text>
        <Text style={linkText}>{magicLinkUrl}</Text>
      </Section>

      <Text style={footerText}>
        For security reasons, this email was sent from a secure server. Do not reply to this email.
      </Text>
    </EmailLayout>
  );
}

// Styles matching ACE Investment Properties brand
const titleSection = {
  textAlign: 'center',
  marginBottom: '32px',
};

const icon = {
  fontSize: '48px',
  margin: '0 0 16px 0',
};

const heading = {
  color: '#1f2937',
  fontSize: '32px',
  fontFamily: '"Playfair Display", Georgia, serif',
  fontWeight: '500',
  margin: '0 0 8px 0',
};

const subtitle = {
  color: '#6b7280',
  fontSize: '16px',
  margin: 0,
};

const infoBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const infoTable = {
  width: '100%',
  borderCollapse: 'collapse',
};

const infoLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '600',
  padding: '8px 0',
  width: '80px',
};

const infoValue = {
  color: '#1f2937',
  fontSize: '14px',
  padding: '8px 0',
};

const buttonSection = {
  textAlign: 'center',
  margin: '32px 0',
};

const signInButton = {
  backgroundColor: '#4169E1',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '0',
  textDecoration: 'none',
  fontWeight: 'bold',
  display: 'inline-block',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const securityBox = {
  backgroundColor: '#fffbeb',
  borderLeft: '4px solid #f97316',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const securityHeading = {
  color: '#92400e',
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 12px 0',
};

const securityText = {
  color: '#78350f',
  fontSize: '14px',
  margin: '6px 0',
  lineHeight: '22px',
  paddingLeft: '5px',
};

const alternativeBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const alternativeHeading = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 10px 0',
};

const alternativeText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 10px 0',
  lineHeight: '20px',
};

const linkText = {
  color: '#4169E1',
  fontSize: '12px',
  wordBreak: 'break-all',
  fontFamily: 'monospace',
  backgroundColor: '#ffffff',
  padding: '10px',
  borderRadius: '0',
  border: '1px solid #e5e7eb',
};

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  textAlign: 'center',
  margin: '30px 0 0 0',
  lineHeight: '20px',
  fontStyle: 'italic',
};
