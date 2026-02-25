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

export default function MagicLink({
  email = 'user@example.com',
  magicLinkUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?token=abc123`,
}) {
  return (
    <EmailLayout preview="Click to sign in - No password needed">
      <EmailHeader
        iconName="key"
        iconColor="#10b981"
        title="Your Login Link"
        subtitle="Click the button below to sign in to your Ace Investment Properties account."
      />

      {/* Info Box */}
      <EmailBox variant="plain-white">
        <table style={infoTable}>
          <tbody>
            <tr>
              <td style={infoLabel}>Email:</td>
              <td style={infoValue}>{email}</td>
            </tr>
          </tbody>
        </table>
      </EmailBox>

      {/* Sign In Button */}
      <Section style={buttonSection}>
        <Button href={magicLinkUrl} style={signInButton}>
          Sign In to Your Account
        </Button>
      </Section>

      <Hr style={hr} />

      {/* Security Info */}
      <EmailBox variant="orange">
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
      </EmailBox>

      {/* Alternative Link */}
      <EmailBox variant="plain">
        <Heading as="h3" style={alternativeHeading}>
          Button not working?
        </Heading>
        <Text style={alternativeText}>
          Copy and paste this link into your browser:
        </Text>
        <Text style={linkText}>{magicLinkUrl}</Text>
      </EmailBox>

      <Text style={footerText}>
        For security reasons, this email was sent from a secure server. Do not reply to this email.
      </Text>
    </EmailLayout>
  );
}

// Styles matching ACE Investment Properties brand
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

const signInButton = {
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

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  textAlign: 'center',
  margin: '30px 0 0 0',
  lineHeight: '20px',
  fontStyle: 'italic',
};
