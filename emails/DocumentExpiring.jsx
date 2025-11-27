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

export default function DocumentExpiring({
  landlordName = 'John Smith',
  propertyTitle = 'Modern 2 Bedroom Apartment',
  propertyAddress = '123 Nash Road, London, E1 1AA',
  documentType = 'Gas Safety Certificate',
  expiryDate = '2026-02-15',
  daysUntilExpiry = 14,
  uploadLink = `${process.env.NEXT_PUBLIC_SITE_URL}/landlord/documents`,
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/landlord/dashboard`,
}) {
  const isUrgent = daysUntilExpiry <= 7;
  const isExpired = daysUntilExpiry < 0;

  const formattedDate = new Date(expiryDate).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <EmailLayout preview="Document expiring soon - Action required">
      {/* Icon + Title */}
      <Section style={titleSection}>
        <Text style={icon}>
          {isExpired ? '⚠️' : '⏰'}
        </Text>
        <Heading style={heading}>
          {isExpired ? 'Document Expired' : 'Document Expiring Soon'}
        </Heading>
        <Text style={subtitle}>
          Hi {landlordName}, this is a reminder that {isExpired ? 'a document has expired' : 'one of your documents is expiring soon'} for your property.
        </Text>
      </Section>

      {/* Property Box - Blue Border */}
      <Section style={propertyBox}>
        <Heading as="h2" style={propertyTitle}>
          {propertyTitle}
        </Heading>
        <Text style={propertyAddress}>
          {propertyAddress}
        </Text>
      </Section>

      {/* Warning Box - Orange/Red */}
      <Section style={isExpired ? expiredBox : (isUrgent ? urgentBox : warningBox)}>
        <Heading as="h3" style={warningHeading}>
          {isExpired ? '❌ Expired Document' : (isUrgent ? '⚠️ Urgent Action Required' : '📋 Document Status')}
        </Heading>
        <table style={infoTable}>
          <tbody>
            <tr>
              <td style={infoLabel}>Document:</td>
              <td style={infoValue}>{documentType}</td>
            </tr>
            <tr>
              <td style={infoLabel}>
                {isExpired ? 'Expired on:' : 'Expires on:'}
              </td>
              <td style={infoValue}>{formattedDate}</td>
            </tr>
            {!isExpired && (
              <tr>
                <td style={infoLabel}>Days remaining:</td>
                <td>
                  <span style={isUrgent ? urgentBadge : warningBadge}>
                    {daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'}
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Section>

      {/* Why This Matters - Light Yellow Box */}
      <Section style={infoBox}>
        <Heading as="h3" style={infoHeading}>
          Why This Matters
        </Heading>
        {isExpired ? (
          <>
            <Text style={infoText}>• Your property is currently non-compliant with legal requirements</Text>
            <Text style={infoText}>• This may affect your insurance coverage</Text>
            <Text style={infoText}>• You could face legal penalties</Text>
            <Text style={infoText}>• Your property listing may be suspended until updated</Text>
          </>
        ) : (
          <>
            <Text style={infoText}>• Maintaining up-to-date documents is a legal requirement</Text>
            <Text style={infoText}>• Expired documents may affect your insurance</Text>
            <Text style={infoText}>• Keep your property listing active and compliant</Text>
            <Text style={infoText}>• Protect yourself and your tenants</Text>
          </>
        )}
      </Section>

      {/* Next Steps - Green Box */}
      <Section style={nextStepsBox}>
        <Heading as="h3" style={nextStepsHeading}>
          What You Need To Do:
        </Heading>
        <Text style={stepText}>1. Arrange a new {documentType.toLowerCase()} inspection</Text>
        <Text style={stepText}>2. Once completed, upload the new document to your dashboard</Text>
        <Text style={stepText}>3. We'll verify and update your property records</Text>
      </Section>

      {/* Action Buttons */}
      <Section style={buttonSection}>
        <Button href={uploadLink} style={uploadButton}>
          Upload New Document
        </Button>
      </Section>

      <Hr style={hr} />

      <Section style={dashboardSection}>
        <Button href={dashboardLink} style={dashboardButton}>
          Go to Dashboard
        </Button>
      </Section>

      <Text style={reminderText}>
        <strong>Set up reminders:</strong> We'll automatically notify you 30, 14, and 7 days before any document expires.
      </Text>

      <Text style={footerText}>
        Need help? Contact our support team and we'll assist you with the renewal process.
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

const propertyBox = {
  border: '2px solid #e5e7eb',
  borderRadius: '0',
  padding: '24px',
  marginBottom: '24px',
  backgroundColor: '#ffffff',
};

const propertyTitle = {
  color: '#1f2937',
  fontSize: '24px',
  fontFamily: '"Playfair Display", Georgia, serif',
  fontWeight: '500',
  margin: '0 0 8px 0',
};

const propertyAddress = {
  color: '#6b7280',
  fontSize: '14px',
  margin: 0,
};

const warningBox = {
  backgroundColor: '#f8f9fa',
  borderLeft: '4px solid #f97316',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const urgentBox = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #ef4444',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const expiredBox = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #dc2626',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const warningHeading = {
  color: '#92400e',
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
  width: '150px',
};

const infoValue = {
  color: '#1f2937',
  fontSize: '14px',
  padding: '8px 0',
};

const warningBadge = {
  backgroundColor: '#f97316',
  color: '#ffffff',
  padding: '4px 12px',
  borderRadius: '0',
  fontSize: '12px',
  fontWeight: 'bold',
};

const urgentBadge = {
  backgroundColor: '#ef4444',
  color: '#ffffff',
  padding: '4px 12px',
  borderRadius: '0',
  fontSize: '12px',
  fontWeight: 'bold',
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
  margin: '6px 0',
  lineHeight: '22px',
  paddingLeft: '5px',
};

const nextStepsBox = {
  backgroundColor: '#f8f9fa', borderLeft: '4px solid #10b981',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const nextStepsHeading = {
  color: '#047857',
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 16px 0',
};

const stepText = {
  color: '#065f46',
  fontSize: '14px',
  margin: '6px 0',
  lineHeight: '22px',
};

const buttonSection = {
  textAlign: 'center',
  margin: '32px 0',
};

const uploadButton = {
  backgroundColor: '#f97316',
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

const dashboardSection = {
  textAlign: 'center',
  margin: '20px 0',
};

const dashboardButton = {
  backgroundColor: '#1a1a2e',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '0',
  textDecoration: 'none',
  fontWeight: 'bold',
  display: 'inline-block',
};

const reminderText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#f8f9fa',
  borderRadius: '0',
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  textAlign: 'center',
  margin: '20px 0',
  lineHeight: '22px',
};
