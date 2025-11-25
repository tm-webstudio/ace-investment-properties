import {
  Heading,
  Text,
  Section,
  Button,
  Hr,
  Img,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

export default function ViewingRequest({
  propertyTitle = 'Modern 2 Bedroom Apartment',
  propertyAddress = '123 Nash Road, London, E1 1AA',
  propertyImage = '',
  viewerName = 'Jane Doe',
  viewerEmail = 'jane@example.com',
  viewerPhone = '+44 7700 900001',
  viewerType = 'Investor',
  viewingDate = '2026-01-15',
  viewingTime = '14:00',
  message = 'I am interested in viewing this property. Please let me know if this time works for you.',
  approveLink = `${process.env.NEXT_PUBLIC_SITE_URL}/api/viewings/approve?id=123`,
  declineLink = `${process.env.NEXT_PUBLIC_SITE_URL}/api/viewings/decline?id=123`,
}) {
  return (
    <EmailLayout preview="New viewing request for your property">
      {/* Icon + Title */}
      <Section style={titleSection}>
        <Text style={icon}>🏠</Text>
        <Heading style={heading}>New Viewing Request</Heading>
        <Text style={subtitle}>
          You have received a new viewing request for your property.
        </Text>
      </Section>

      {/* Property Box - Blue Border */}
      <Section style={propertyBox}>
        {propertyImage && (
          <Img
            src={propertyImage}
            alt={propertyTitle}
            style={propertyImageStyle}
          />
        )}
        <Heading as="h2" style={propertyTitle}>
          {propertyTitle}
        </Heading>
        <Text style={propertyAddress}>
          📍 {propertyAddress}
        </Text>
      </Section>

      {/* Requester Info - Light Yellow Box */}
      <Section style={infoBox}>
        <Heading as="h3" style={infoHeading}>
          Requester Information
        </Heading>
        <table style={infoTable}>
          <tbody>
            <tr>
              <td style={infoLabel}>Name:</td>
              <td style={infoValue}>{viewerName}</td>
            </tr>
            <tr>
              <td style={infoLabel}>Email:</td>
              <td style={infoValue}>{viewerEmail}</td>
            </tr>
            <tr>
              <td style={infoLabel}>Phone:</td>
              <td style={infoValue}>{viewerPhone}</td>
            </tr>
            <tr>
              <td style={infoLabel}>Type:</td>
              <td>
                <span style={badge}>{viewerType}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* Viewing Details */}
      <Section style={detailsSection}>
        <Text style={detailsText}>
          <strong>Requested Date:</strong>{' '}
          {new Date(viewingDate).toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <Text style={detailsText}>
          <strong>Requested Time:</strong> {viewingTime}
        </Text>
        {message && (
          <>
            <Text style={detailsText}>
              <strong>Message:</strong>
            </Text>
            <Text style={messageText}>"{message}"</Text>
          </>
        )}
      </Section>

      {/* Action Buttons */}
      <Section style={buttonSection}>
        <Button href={approveLink} style={approveButton}>
          ✓ Approve Viewing
        </Button>
        <Button href={declineLink} style={declineButton}>
          ✗ Decline Request
        </Button>
      </Section>

      <Hr style={hr} />

      <Text style={tipText}>
        💡 <strong>Tip:</strong> Quick responses lead to better tenant relationships and faster bookings!
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
  border: '3px solid #4169E1',
  borderRadius: '0',
  padding: '24px',
  marginBottom: '24px',
  backgroundColor: '#ffffff',
};

const propertyImageStyle = {
  width: '100%',
  height: 'auto',
  borderRadius: '0',
  marginBottom: '16px',
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

const infoBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '0',
  padding: '20px',
  marginBottom: '24px',
};

const infoHeading = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
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

const badge = {
  backgroundColor: '#4169E1',
  color: '#ffffff',
  padding: '4px 12px',
  borderRadius: '0',
  fontSize: '12px',
  fontWeight: 'bold',
};

const detailsSection = {
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
  padding: '12px',
  backgroundColor: '#f8f9fa',
  borderLeft: '3px solid #4169E1',
  margin: '8px 0',
};

const buttonSection = {
  textAlign: 'center',
  margin: '32px 0',
};

const approveButton = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '0',
  textDecoration: 'none',
  fontWeight: 'bold',
  display: 'inline-block',
  margin: '0 8px 12px 8px',
};

const declineButton = {
  backgroundColor: '#ef4444',
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
  padding: '15px',
  backgroundColor: '#fffbeb',
  borderRadius: '0',
};
