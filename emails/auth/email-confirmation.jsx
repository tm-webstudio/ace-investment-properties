import {
  Heading,
  Text,
  Section,
  Button,
  Hr,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout from '../components/email-layout';
import EmailHeader from '../components/email-header';
import EmailBox from '../components/email-box';

export default function EmailConfirmation({
  email = 'user@example.com',
  confirmationUrl,
  confirmationLink, // legacy prop name
}) {
  // Accept either confirmationUrl or confirmationLink for backwards compatibility
  const finalUrl = confirmationUrl || confirmationLink || `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`

  return (
    <EmailLayout preview="Please confirm your email to get started">
      <EmailHeader
        iconName="mail"
        iconColor="#10b981"
        title="Confirm Your Email"
        subtitle="Thank you for signing up for Ace Investment Properties!"
      />

      {/* Info Box */}
      <EmailBox variant="plain-white">
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
      </EmailBox>

      {/* Confirmation Button */}
      <Section style={buttonSection}>
        <Text style={instructionText}>
          Click the button below to confirm your email address:
        </Text>
        <Button href={finalUrl} style={confirmButton}>
          Confirm Email Address
        </Button>
      </Section>

      <Hr style={hr} />

      {/* Security Info */}
      <EmailBox variant="orange">
        <Heading as="h3" style={securityHeading}>
          🔒 Security Notice
        </Heading>
        <Text style={securityText}>
          This confirmation link will expire in 24 hours. If you didn't create an account with Ace Investment Properties, you can safely ignore this email.
        </Text>
      </EmailBox>

      {/* Alternative Link */}
      <Text style={footerText}>
        Need help? Contact our support team at support@aceinvestmentproperties.co.uk
      </Text>
    </EmailLayout>
  );
}

// Styles matching ACE Investment Properties brand
const titleSection = {
  textAlign: 'center',
  marginBottom: '24px',
};

const icon = {
  fontSize: '48px',
  margin: '0 0 16px 0',
};

const heading = {
  color: '#1f2937',
  fontSize: '28px',
  fontFamily: '"Playfair Display", Georgia, serif',
  fontWeight: '500',
  margin: '0 0 8px 0',
};

const subtitle = {
  color: '#6b7280',
  fontSize: '16px',
  margin: 0,
};

const infoHeading = {
  color: '#1f2937',
  fontSize: '15px',
  fontWeight: '500',
  margin: '0 0 10px 0',
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
  padding: '4px 0',
  width: '80px',
};

const infoValue = {
  color: '#1f2937',
  fontSize: '14px',
  padding: '4px 0',
};

const buttonSection = {
  textAlign: 'center',
  margin: '20px 0',
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
  padding: '12px 24px',
  borderRadius: '0',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '600',
  display: 'inline-block',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
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
