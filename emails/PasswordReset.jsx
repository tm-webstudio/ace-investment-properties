import {
  Heading,
  Text,
  Section,
  Button,
  Hr,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

export default function PasswordReset({
  name = 'User',
  resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=abc123`,
  expiryMinutes = 60,
}) {
  return (
    <EmailLayout preview="Reset your password">
      {/* Icon + Title */}
      <Section style={titleSection}>
        <Text style={icon}>🔐</Text>
        <Heading style={heading}>Password Reset Request</Heading>
        <Text style={subtitle}>
          Hi {name}, we received a request to reset the password for your Ace Properties account.
        </Text>
      </Section>

      {/* Security Notice - Orange Box */}
      <Section style={securityBox}>
        <Heading as="h3" style={securityHeading}>
          🛡️ Security Notice
        </Heading>
        <Text style={securityText}>
          If you didn't request this password reset, please ignore this email. Your account is safe and no changes have been made.
        </Text>
      </Section>

      {/* Reset Button */}
      <Section style={buttonSection}>
        <Text style={instructionText}>
          Click the button below to reset your password:
        </Text>
        <Button href={resetLink} style={resetButton}>
          Reset My Password
        </Button>
      </Section>

      <Hr style={hr} />

      {/* Link Alternative - Light Gray Box */}
      <Section style={alternativeBox}>
        <Heading as="h3" style={alternativeHeading}>
          Button not working?
        </Heading>
        <Text style={alternativeText}>
          Copy and paste this link into your browser:
        </Text>
        <Text style={linkText}>{resetLink}</Text>
      </Section>

      {/* Important Info - Light Yellow Box */}
      <Section style={infoBox}>
        <Heading as="h3" style={infoHeading}>
          Important Information:
        </Heading>
        <Text style={infoItem}>⏰ This link will expire in {expiryMinutes} minutes</Text>
        <Text style={infoItem}>🔒 This link can only be used once</Text>
        <Text style={infoItem}>🌐 Make sure you're on aceinvestmentproperties.co.uk</Text>
        <Text style={infoItem}>❌ Never share this link with anyone</Text>
      </Section>

      {/* Password Tips - Green Box */}
      <Section style={tipsBox}>
        <Heading as="h3" style={tipsHeading}>
          Create a Strong Password:
        </Heading>
        <Text style={tipText}>• Use at least 8 characters</Text>
        <Text style={tipText}>• Mix uppercase and lowercase letters</Text>
        <Text style={tipText}>• Include numbers and symbols</Text>
        <Text style={tipText}>• Avoid common words or personal information</Text>
        <Text style={tipText}>• Don't reuse passwords from other accounts</Text>
      </Section>

      {/* Help Section - Red Box */}
      <Section style={helpBox}>
        <Text style={helpText}>
          <strong>Didn't request this?</strong><br />
          If you didn't request a password reset, please contact our security team immediately at{' '}
          <a href="mailto:security@aceinvestmentproperties.co.uk" style={link}>
            security@aceinvestmentproperties.co.uk
          </a>
        </Text>
      </Section>

      <Hr style={hr} />

      <Text style={footerText}>
        For your security, this email was sent from a secure server. Do not reply to this email.
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
  margin: '0',
  lineHeight: '22px',
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

const resetButton = {
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

const alternativeBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const alternativeHeading = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '500',
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

const infoBox = {
  backgroundColor: '#fef3c7',
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

const infoItem = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '8px 0',
  lineHeight: '22px',
  paddingLeft: '5px',
};

const tipsBox = {
  backgroundColor: '#ecfdf5',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const tipsHeading = {
  color: '#047857',
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 16px 0',
};

const tipText = {
  color: '#065f46',
  fontSize: '14px',
  margin: '6px 0',
  lineHeight: '22px',
  paddingLeft: '5px',
};

const helpBox = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #ef4444',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const helpText = {
  color: '#991b1b',
  fontSize: '14px',
  margin: '0',
  lineHeight: '22px',
};

const link = {
  color: '#dc2626',
  textDecoration: 'underline',
};

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  textAlign: 'center',
  margin: '30px 0 0 0',
  lineHeight: '20px',
  fontStyle: 'italic',
};
