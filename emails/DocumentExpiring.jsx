import {
  Heading,
  Text,
  Section,
  Button,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

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
      <Heading style={heading}>
        {isExpired ? '⚠️ Document Expired' : '⏰ Document Expiring Soon'}
      </Heading>

      <Text style={text}>
        Hi {landlordName},
      </Text>

      <Text style={text}>
        This is a reminder that {isExpired ? 'a document has expired' : 'one of your documents is expiring soon'} for your property.
      </Text>

      {/* Property Details */}
      <Section style={propertySection}>
        <Heading style={propertyTitle}>{propertyTitle}</Heading>
        <Text style={propertyAddress}>📍 {propertyAddress}</Text>
      </Section>

      {/* Warning Box */}
      <Section style={isExpired ? expiredSection : (isUrgent ? urgentSection : warningSection)}>
        <Text style={warningHeading}>
          {isExpired ? '❌ Expired Document' : (isUrgent ? '⚠️ Urgent Action Required' : '📋 Document Status')}
        </Text>

        <Row style={detailRow}>
          <Column style={detailLabel}>Document:</Column>
          <Column style={detailValue}>{documentType}</Column>
        </Row>

        <Row style={detailRow}>
          <Column style={detailLabel}>
            {isExpired ? 'Expired on:' : 'Expires on:'}
          </Column>
          <Column style={detailValue}>{formattedDate}</Column>
        </Row>

        {!isExpired && (
          <Row style={detailRow}>
            <Column style={detailLabel}>Days remaining:</Column>
            <Column style={detailValue}>
              <span style={isUrgent ? urgentBadge : daysBadge}>
                {daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'}
              </span>
            </Column>
          </Row>
        )}
      </Section>

      {/* Why This Matters */}
      <Section style={infoSection}>
        <Text style={infoHeading}>Why This Matters</Text>
        {isExpired ? (
          <>
            <Text style={infoText}>
              • Your property is currently non-compliant with legal requirements
            </Text>
            <Text style={infoText}>
              • This may affect your insurance coverage
            </Text>
            <Text style={infoText}>
              • You could face legal penalties
            </Text>
            <Text style={infoText}>
              • Your property listing may be suspended until updated
            </Text>
          </>
        ) : (
          <>
            <Text style={infoText}>
              • Maintaining up-to-date documents is a legal requirement
            </Text>
            <Text style={infoText}>
              • Expired documents may affect your insurance
            </Text>
            <Text style={infoText}>
              • Keep your property listing active and compliant
            </Text>
            <Text style={infoText}>
              • Protect yourself and your tenants
            </Text>
          </>
        )}
      </Section>

      {/* Next Steps */}
      <Section style={nextStepsSection}>
        <Text style={nextStepsHeading}>What You Need To Do:</Text>
        <Text style={stepText}>1. Arrange a new {documentType.toLowerCase()} inspection</Text>
        <Text style={stepText}>2. Once completed, upload the new document to your dashboard</Text>
        <Text style={stepText}>3. We'll verify and update your property records</Text>
      </Section>

      {/* Action Button */}
      <Section style={buttonSection}>
        <Button href={uploadLink} style={uploadButton}>
          Upload New Document
        </Button>
      </Section>

      <Section style={dashboardSection}>
        <Button href={dashboardLink} style={dashboardButton}>
          Go to Dashboard
        </Button>
      </Section>

      <Text style={reminderText}>
        💡 <strong>Set up reminders:</strong> We'll automatically notify you 30, 14, and 7 days before any document expires.
      </Text>

      <Text style={footerText}>
        Need help? Contact our support team and we'll assist you with the renewal process.
      </Text>
    </EmailLayout>
  );
}

const heading = {
  color: '#f97316',
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

const propertySection = {
  margin: '20px 0',
  padding: '20px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
};

const propertyTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 8px 0',
};

const propertyAddress = {
  fontSize: '14px',
  color: '#666',
  margin: '0',
};

const warningSection = {
  margin: '30px 0',
  padding: '20px',
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
  borderLeft: '4px solid #f97316',
};

const urgentSection = {
  margin: '30px 0',
  padding: '20px',
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  borderLeft: '4px solid #ef4444',
};

const expiredSection = {
  margin: '30px 0',
  padding: '20px',
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  borderLeft: '4px solid #dc2626',
};

const warningHeading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 15px 0',
};

const detailRow = {
  marginBottom: '10px',
};

const detailLabel = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#666',
  width: '150px',
};

const detailValue = {
  fontSize: '14px',
  color: '#1a1a1a',
};

const daysBadge = {
  backgroundColor: '#f97316',
  color: '#fff',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 'bold',
};

const urgentBadge = {
  backgroundColor: '#ef4444',
  color: '#fff',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 'bold',
};

const infoSection = {
  margin: '30px 0',
  padding: '20px',
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
};

const infoHeading = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 10px 0',
};

const infoText = {
  fontSize: '14px',
  color: '#333',
  margin: '6px 0',
  lineHeight: '22px',
  paddingLeft: '5px',
};

const nextStepsSection = {
  margin: '30px 0',
  padding: '20px',
  backgroundColor: '#ecfdf5',
  borderRadius: '8px',
};

const nextStepsHeading = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#047857',
  margin: '0 0 10px 0',
};

const stepText = {
  fontSize: '14px',
  color: '#065f46',
  margin: '6px 0',
  lineHeight: '22px',
};

const buttonSection = {
  textAlign: 'center',
  margin: '30px 0',
};

const uploadButton = {
  backgroundColor: '#f97316',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  padding: '14px 32px',
  display: 'inline-block',
};

const dashboardSection = {
  textAlign: 'center',
  margin: '20px 0',
};

const dashboardButton = {
  backgroundColor: '#1a1a1a',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center',
  padding: '12px 24px',
  display: 'inline-block',
};

const reminderText = {
  fontSize: '14px',
  color: '#666',
  lineHeight: '22px',
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#fffbeb',
  borderRadius: '6px',
};

const footerText = {
  fontSize: '14px',
  color: '#666',
  textAlign: 'center',
  margin: '20px 0',
  lineHeight: '22px',
};
