import {
  Heading,
  Text,
  Section,
  Button,
  Hr,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';
import { EmailIcon } from './components/EmailIcon';

export default function EmailConfirmation({
  email = 'user@example.com',
  confirmationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?token=abc123`,
}) {
  return (
    <EmailLayout preview="Confirm your email address">
      {/* Icon + Title */}
      <Section style={titleSection}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <EmailIcon name="mail" color="#10b981" size={48} />
        </div>
        <Heading style={heading}>Confirm Your Email</Heading>
        <Text style={subtitle}>
          Thank you for signing up for Ace Investment Properties!
        </Text>
      </Section>

      {/* Info Box */}
      <Section style={infoBox}>
        <Heading as="h3" style={infoHeading}>
          Verify Your Account
        </Heading>
        <Text style={infoText}>
          We need to verify your email address to activate your account and ensure the security of your information.
        </Text>
        <table style={infoTable}>
          <tbody>
            <tr>
              <td style={infoLabel}>Email:</td>
              <td style={infoValue}>{email}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* Confirmation Button */}
      <Section style={buttonSection}>
        <Text style={instructionText}>
          Click the button below to confirm your email address:
        </Text>
        <Button href={confirmationUrl} style={confirmButton}>
          Confirm Email Address
        </Button>
      </Section>

      <Hr style={hr} />

      {/* Security Info */}
      <Section style={securityBox}>
        <Heading as="h3" style={securityHeading}>
          🔒 Security Notice
        </Heading>
        <Text style={securityText}>
          This confirmation link will expire in 24 hours. If you didn't create an account with Ace Investment Properties, you can safely ignore this email.
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
        <Text style={linkText}>{confirmationUrl}</Text>
      </Section>

      <Text style={footerText}>
        Need help? Contact our support team at support@aceinvestmentproperties.co.uk
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
  backgroundColor: '#ffffff',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const infoHeading = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 16px 0',
};

const infoText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 16px 0',
  lineHeight: '22px',
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

const instructionText = {
  color: '#1f2937',
  fontSize: '16px',
  margin: '0 0 20px 0',
  textAlign: 'center',
};

const confirmButton = {
  backgroundColor: '#10b981',
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
  backgroundColor: '#f8f9fa',
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
  margin: '0',
  lineHeight: '22px',
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
  color: '#10b981',
  fontSize: '12px',
  wordBreak: 'break-all',
  fontFamily: 'monospace',
  backgroundColor: '#ffffff',
  padding: '10px',
  borderRadius: '0',
  border: '1px solid #e5e7eb',
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  textAlign: 'center',
  margin: '20px 0',
  lineHeight: '22px',
};
