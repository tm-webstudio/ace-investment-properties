import {
  Heading,
  Text,
  Section,
  Button,
  Hr,
  Img,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout from '../components/email-layout';
import { EmailIcon } from '../components/email-icon';

export default function ViewingReminder({
  propertyTitle = 'Modern 2 Bedroom Apartment',
  propertyAddress = '123 Nash Road, London, E1 1AA',
  propertyImage = '',
  viewingDate = '2026-01-15',
  viewingTime = '14:00',
  landlordName = 'John Smith',
  landlordPhone = '+44 7700 900000',
  directionsLink = '',
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/investor/dashboard`,
}) {
  const formattedDate = new Date(viewingDate).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const mapsLink = directionsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(propertyAddress)}`;

  return (
    <EmailLayout preview="Reminder: Your property viewing is tomorrow">
      {/* Icon + Title */}
      <Section style={titleSection}>
        <Text style={icon}>⏰</Text>
        <Heading style={heading}>Viewing Tomorrow!</Heading>
        <Text style={subtitle}>
          This is a friendly reminder about your upcoming property viewing.
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
          {propertyAddress}
        </Text>
      </Section>

      {/* Viewing Details - Yellow Box */}
      <Section style={infoBox}>
        <Heading as="h3" style={infoHeading}>
          Viewing Details
        </Heading>
        <table style={infoTable}>
          <tbody>
            <tr>
              <td style={infoLabel}>Date:</td>
              <td style={infoValue}>{formattedDate}</td>
            </tr>
            <tr>
              <td style={infoLabel}>Time:</td>
              <td style={infoValue}>{viewingTime}</td>
            </tr>
            <tr>
              <td style={infoLabel}>Landlord:</td>
              <td style={infoValue}>{landlordName}</td>
            </tr>
            <tr>
              <td style={infoLabel}>Contact:</td>
              <td style={infoValue}>{landlordPhone}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* Action Button */}
      <Section style={buttonSection}>
        <Button href={mapsLink} style={directionsButton}>
          Get Directions
        </Button>
      </Section>

      <Hr style={hr} />

      {/* Tips Box - Green */}
      <Section style={tipsBox}>
        <Heading as="h3" style={tipsHeading}>
          Viewing Checklist
        </Heading>
        <Text style={tipText}>Arrive 5 minutes early</Text>
        <Text style={tipText}>Bring photo ID</Text>
        <Text style={tipText}>Prepare your questions</Text>
        <Text style={tipText}>Take photos/notes if permitted</Text>
        <Text style={tipText}>Check all rooms and amenities</Text>
        <Text style={tipText}>Note any concerns or repairs needed</Text>
      </Section>

      <Section style={dashboardSection}>
        <Button href={dashboardLink} style={dashboardButton}>
          View My Dashboard
        </Button>
      </Section>

      <Text style={footerText}>
        Need to cancel or reschedule? Please contact the landlord as soon as possible.
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

const buttonSection = {
  textAlign: 'center',
  margin: '32px 0',
};

const directionsButton = {
  backgroundColor: '#10b981',
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

const tipsBox = {
  backgroundColor: '#f8f9fa', borderLeft: '4px solid #10b981',
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
  margin: '5px 0',
  lineHeight: '20px',
};

const dashboardSection = {
  textAlign: 'center',
  margin: '30px 0',
};

const dashboardButton = {
  backgroundColor: '#1a1a2e',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '0',
  textDecoration: 'none',
  fontWeight: 'bold',
  display: 'inline-block',
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  textAlign: 'center',
  margin: '20px 0',
  lineHeight: '22px',
};
