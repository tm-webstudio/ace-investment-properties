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

export default function EmailChange({
  oldEmail = 'old@example.com',
  newEmail = 'new@example.com',
  confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm-email-change?token=abc123`,
}) {
  return (
    <EmailLayout preview="Confirm your new email address">
      <EmailHeader
        iconName="envelope"
        iconColor="#10b981"
        title="Confirm Email Change"
        subtitle="We received a request to change your email address."
      />

      {/* Email Change Details - Yellow Box */}
      <EmailBox variant="plain-white">
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
      </EmailBox>

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
      <EmailBox variant="red">
        <Heading as="h3" style={warningHeading}>
          ⚠️ Important Security Notice
        </Heading>
        <Text style={warningText}>
          If you did not request this email change, please contact our security team immediately at security@aceinvestmentproperties.co.uk
        </Text>
        <Text style={warningText}>
          Your account security may be at risk if this was not authorized by you.
        </Text>
      </EmailBox>

      {/* Info Box */}
      <EmailBox variant="green-dark">
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
      </EmailBox>

      {/* Alternative Link */}
      <EmailBox variant="plain">
        <Heading as="h3" style={alternativeHeading}>
          Button not working?
        </Heading>
        <Text style={alternativeText}>
          Copy and paste this link into your browser:
        </Text>
        <Text style={linkText}>{confirmUrl}</Text>
      </EmailBox>
    </EmailLayout>
  );
}

// Styles matching ACE Investment Properties brand
const infoHeading = {
  color: '#1f2937',
  fontSize: '15px',
  fontWeight: '500',
  margin: '0 0 10px 0',
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
  width: '120px',
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
