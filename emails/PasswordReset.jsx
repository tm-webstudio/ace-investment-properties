import {
  Heading,
  Text,
  Section,
  Button,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

export default function PasswordReset({
  name = 'User',
  resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=abc123`,
  expiryMinutes = 60,
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
}) {
  return (
    <EmailLayout preview="Reset your password">
      <Heading style={heading}>🔐 Password Reset Request</Heading>

      <Text style={text}>
        Hi {name},
      </Text>

      <Text style={text}>
        We received a request to reset the password for your Ace Properties account.
      </Text>

      {/* Security Notice */}
      <Section style={securitySection}>
        <Text style={securityHeading}>🛡️ Security Notice</Text>
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

      {/* Link Alternative */}
      <Section style={alternativeSection}>
        <Text style={alternativeHeading}>Button not working?</Text>
        <Text style={alternativeText}>
          Copy and paste this link into your browser:
        </Text>
        <Text style={linkText}>{resetLink}</Text>
      </Section>

      {/* Important Info */}
      <Section style={infoSection}>
        <Text style={infoHeading}>Important Information:</Text>
        <Text style={infoItem}>⏰ This link will expire in {expiryMinutes} minutes</Text>
        <Text style={infoItem}>🔒 This link can only be used once</Text>
        <Text style={infoItem}>🌐 Make sure you're on aceinvestmentproperties.co.uk</Text>
        <Text style={infoItem}>❌ Never share this link with anyone</Text>
      </Section>

      {/* Password Tips */}
      <Section style={tipsSection}>
        <Text style={tipsHeading}>Create a Strong Password:</Text>
        <Text style={tipText}>• Use at least 8 characters</Text>
        <Text style={tipText}>• Mix uppercase and lowercase letters</Text>
        <Text style={tipText}>• Include numbers and symbols</Text>
        <Text style={tipText}>• Avoid common words or personal information</Text>
        <Text style={tipText}>• Don't reuse passwords from other accounts</Text>
      </Section>

      {/* Help Section */}
      <Section style={helpSection}>
        <Text style={helpText}>
          <strong>Didn't request this?</strong><br />
          If you didn't request a password reset, please contact our security team immediately at{' '}
          <a href="mailto:security@aceinvestmentproperties.co.uk" style={link}>
            security@aceinvestmentproperties.co.uk
          </a>
        </Text>
      </Section>

      <Text style={footerText}>
        For your security, this email was sent from a secure server. Do not reply to this email.
      </Text>
    </EmailLayout>
  );
}

const heading = {
  color: '#0066cc',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 20px 0',
  textAlign: 'center',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 15px 0',
};

const securitySection = {
  margin: '30px 0',
  padding: '20px',
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
  borderLeft: '4px solid #f59e0b',
};

const securityHeading = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 10px 0',
};

const securityText = {
  fontSize: '14px',
  color: '#78350f',
  margin: '0',
  lineHeight: '22px',
};

const buttonSection = {
  textAlign: 'center',
  margin: '30px 0',
};

const instructionText = {
  fontSize: '16px',
  color: '#333',
  margin: '0 0 20px 0',
  textAlign: 'center',
};

const resetButton = {
  backgroundColor: '#0066cc',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  padding: '14px 32px',
  display: 'inline-block',
};

const alternativeSection = {
  margin: '30px 0',
  padding: '20px',
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
};

const alternativeHeading = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 10px 0',
};

const alternativeText = {
  fontSize: '14px',
  color: '#666',
  margin: '0 0 10px 0',
  lineHeight: '20px',
};

const linkText = {
  fontSize: '12px',
  color: '#0066cc',
  wordBreak: 'break-all',
  fontFamily: 'monospace',
  backgroundColor: '#f9fafb',
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #e5e5e5',
};

const infoSection = {
  margin: '30px 0',
  padding: '20px',
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  borderLeft: '4px solid #0066cc',
};

const infoHeading = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 12px 0',
};

const infoItem = {
  fontSize: '14px',
  color: '#333',
  margin: '8px 0',
  lineHeight: '22px',
  paddingLeft: '5px',
};

const tipsSection = {
  margin: '30px 0',
  padding: '20px',
  backgroundColor: '#ecfdf5',
  borderRadius: '8px',
};

const tipsHeading = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#047857',
  margin: '0 0 10px 0',
};

const tipText = {
  fontSize: '14px',
  color: '#065f46',
  margin: '6px 0',
  lineHeight: '22px',
  paddingLeft: '5px',
};

const helpSection = {
  margin: '30px 0',
  padding: '20px',
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  borderLeft: '4px solid #ef4444',
};

const helpText = {
  fontSize: '14px',
  color: '#991b1b',
  margin: '0',
  lineHeight: '22px',
};

const link = {
  color: '#dc2626',
  textDecoration: 'underline',
};

const footerText = {
  fontSize: '12px',
  color: '#999',
  textAlign: 'center',
  margin: '30px 0 0 0',
  lineHeight: '20px',
  fontStyle: 'italic',
};
