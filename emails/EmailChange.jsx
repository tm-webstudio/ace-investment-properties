import {
  Heading,
  Text,
  Section,
  Button,
  Hr,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

export default function EmailChange({
  oldEmail = 'old@example.com',
  newEmail = 'new@example.com',
  confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm-email-change?token=abc123`,
}) {
  return (
    <EmailLayout preview="Confirm your email change">
      {/* Icon + Title */}
      <Section style={titleSection}>
        <Text style={icon}>✉️</Text>
        <Heading style={heading}>Confirm Email Change</Heading>
        <Text style={subtitle}>
          We received a request to change your email address.
        </Text>
      </Section>

      {/* Email Change Details - Yellow Box */}
      <Section style={infoBox}>
        <Heading as="h3" style={infoHeading}>
          Email Change Request
        </Heading>
        <table style={infoTable}>
          <tbody>
            <tr>
              <td style={infoLabel}>Current Email:</td>
              <td style={infoValue}>{oldEmail}</td>
            </tr>
            <tr>
              <td style={infoLabel}>New Email:</td>
              <td style={infoValue}><strong>{newEmail}</strong></td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* Confirmation Button */}
      <Section style={buttonSection}>
        <Text style={instructionText}>
          Click the button below to confirm this email change:
        </Text>
        <Button href={confirmUrl} style={confirmButton}>
          Confirm Email Change
        </Button>
      </Section>

      <Hr style={hr} />

      {/* Security Warning */}
      <Section style={warningBox}>
        <Heading as="h3" style={warningHeading}>
          ⚠️ Important Security Notice
        </Heading>
        <Text style={warningText}>
          If you did not request this email change, please contact our security team immediately at security@aceinvestmentproperties.co.uk
        </Text>
        <Text style={warningText}>
          Your account security may be at risk if this was not authorized by you.
        </Text>
      </Section>

      {/* Info Box */}
      <Section style={securityBox}>
        <Heading as="h3" style={securityHeading}>
          What happens next?
        </Heading>
        <Text style={securityText}>
          • This confirmation link will expire in 24 hours
        </Text>
        <Text style={securityText}>
          • After confirmation, you'll use {newEmail} to sign in
        </Text>
        <Text style={securityText}>
          • We'll send a confirmation email to both addresses
        </Text>
        <Text style={securityText}>
          • Your account data and settings remain unchanged
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
        <Text style={linkText}>{confirmUrl}</Text>
      </Section>
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

const infoHeading = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 16px 0',
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
  width: '120px',
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

const warningBox = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #ef4444',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const warningHeading = {
  color: '#991b1b',
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 12px 0',
};

const warningText = {
  color: '#991b1b',
  fontSize: '14px',
  margin: '8px 0',
  lineHeight: '22px',
};

const securityBox = {
  backgroundColor: '#ecfdf5',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const securityHeading = {
  color: '#047857',
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 16px 0',
};

const securityText = {
  color: '#065f46',
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
