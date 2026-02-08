import {
  Heading,
  Text,
  Section,
  Button,
  Hr,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout from '../components/email-layout';
import { EmailIcon } from '../components/email-icon';

export default function ReservationRequest({
  propertyTitle = 'Modern 2 Bedroom Apartment',
  propertyAddress = '123 Nash Road, London, E1 1AA',
  propertyPrice = '1,500',
  requesterName = 'Jane Doe',
  requesterEmail = 'jane@example.com',
  requesterPhone = '+44 7700 900001',
  message = '',
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/admin`,
}) {
  return (
    <EmailLayout preview="New Property Reservation Request">
      {/* Icon + Title */}
      <Section style={titleSection}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <EmailIcon name="home" color="#dc2626" size={48} />
        </div>
        <Heading style={heading}>New Reservation Request</Heading>
        <Text style={subtitle}>
          Someone wants to reserve a property. Review the details below.
        </Text>
      </Section>

      {/* Property Box */}
      <Section style={propertyBox}>
        <Heading as="h2" style={propertyTitleStyle}>
          {propertyTitle}
        </Heading>
        <Text style={propertyAddressStyle}>
          <EmailIcon name="mapPin" color="#6b7280" size={16} />
          {propertyAddress}
        </Text>
        <Text style={propertyPriceStyle}>
          £{propertyPrice}/month
        </Text>
      </Section>

      {/* Requester Info */}
      <Section style={infoBox}>
        <Heading as="h3" style={infoHeading}>
          Requester Information
        </Heading>
        <table style={infoTable}>
          <tbody>
            <tr>
              <td style={infoLabel}>Name:</td>
              <td style={infoValue}>{requesterName}</td>
            </tr>
            <tr>
              <td style={infoLabel}>Email:</td>
              <td style={infoValue}>{requesterEmail}</td>
            </tr>
            <tr>
              <td style={infoLabel}>Phone:</td>
              <td style={infoValue}>{requesterPhone}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* Message */}
      {message && (
        <Section style={messageSection}>
          <Text style={detailsText}>
            <strong>Message from requester:</strong>
          </Text>
          <Text style={messageText}>"{message}"</Text>
        </Section>
      )}

      {/* Action Button */}
      <Section style={buttonSection}>
        <Button href={`mailto:${requesterEmail}?subject=Re: Property Reservation - ${propertyTitle}`} style={contactButton}>
          Reply to Requester
        </Button>
        <Button href={`tel:${requesterPhone.replace(/\s/g, '')}`} style={callButton}>
          Call Requester
        </Button>
      </Section>

      <Hr style={hr} />

      <Text style={tipText}>
        <strong>Priority Request:</strong> Reservation requests indicate high intent. Contact this person promptly to secure the booking!
      </Text>
    </EmailLayout>
  );
}

// Styles
const titleSection = {
  textAlign: 'center',
  marginBottom: '32px',
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
  backgroundColor: '#fef2f2',
  border: '2px solid #fecaca',
  borderRadius: '0',
  padding: '24px',
  marginBottom: '24px',
};

const propertyTitleStyle = {
  color: '#991b1b',
  fontSize: '24px',
  fontFamily: '"Playfair Display", Georgia, serif',
  fontWeight: '500',
  margin: '0 0 8px 0',
};

const propertyAddressStyle = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 8px 0',
  display: 'flex',
  alignItems: 'center',
};

const propertyPriceStyle = {
  color: '#dc2626',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: 0,
};

const infoBox = {
  backgroundColor: '#ffffff',
  border: '2px solid #e5e7eb',
  borderRadius: '0',
  padding: '24px',
  marginBottom: '24px',
};

const infoHeading = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
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
  width: '100px',
};

const infoValue = {
  color: '#1f2937',
  fontSize: '14px',
  padding: '8px 0',
};

const messageSection = {
  marginBottom: '24px',
};

const detailsText = {
  color: '#1f2937',
  fontSize: '14px',
  margin: '8px 0',
};

const messageText = {
  color: '#6b7280',
  fontSize: '14px',
  fontStyle: 'italic',
  padding: '16px',
  backgroundColor: '#f8f9fa',
  borderLeft: '4px solid #dc2626',
  margin: '12px 0',
  borderRadius: '0',
};

const buttonSection = {
  textAlign: 'center',
  margin: '32px 0',
};

const contactButton = {
  backgroundColor: '#dc2626',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '0',
  textDecoration: 'none',
  fontWeight: 'bold',
  display: 'inline-block',
  margin: '0 8px 12px 8px',
};

const callButton = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '0',
  textDecoration: 'none',
  fontWeight: 'bold',
  display: 'inline-block',
  margin: '0 8px 12px 8px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const tipText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '20px 0',
  padding: '16px',
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #dc2626',
  borderRadius: '0',
};
