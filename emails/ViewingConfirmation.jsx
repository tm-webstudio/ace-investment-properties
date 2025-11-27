import {
  Heading,
  Text,
  Img,
  Section,
  Button,
  Hr,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';
import { EmailIcon } from './components/EmailIcon';

export default function ViewingConfirmation({
  propertyTitle = 'Modern 2 Bedroom Apartment',
  propertyAddress = '123 Nash Road, London, E1 1AA',
  propertyImage = '',
  viewingDate = '2026-01-15',
  viewingTime = '14:00',
  landlordName = 'John Smith',
  landlordPhone = '+44 7700 900000',
  dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL}/investor/dashboard`,
}) {
  const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Property+Viewing:+${encodeURIComponent(propertyTitle)}&dates=${viewingDate.replace(/-/g, '')}T${viewingTime.replace(':', '')}00/${viewingDate.replace(/-/g, '')}T${viewingTime.replace(':', '')}00&details=${encodeURIComponent(propertyAddress)}&location=${encodeURIComponent(propertyAddress)}`;
  const directionsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(propertyAddress)}`;

  return (
    <EmailLayout preview="Your viewing has been confirmed!">
      {/* Icon + Title */}
      <Section style={titleSection}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <EmailIcon name="checkCircle" color="#10b981" size={48} />
        </div>
        <Heading style={heading}>Viewing Confirmed!</Heading>
        <Text style={subtitle}>
          Great news! Your viewing request has been approved by the landlord.
        </Text>
      </Section>

      {/* Property Box - White with Border */}
      <Section style={propertyBox}>
        {propertyImage && (
          <Img
            src={propertyImage}
            alt={propertyTitle}
            style={propertyImageStyle}
          />
        )}
        <Heading as="h2" style={propertyTitleStyle}>
          {propertyTitle}
        </Heading>
        <Text style={propertyAddressStyle}>
          <EmailIcon name="mapPin" color="#6b7280" size={16} />
          {propertyAddress}
        </Text>
      </Section>

      {/* Viewing Details - White Box with Border */}
      <Section style={infoBox}>
        <Heading as="h3" style={infoHeading}>
          Viewing Details
        </Heading>
        <table style={infoTable}>
          <tbody>
            <tr>
              <td style={infoLabel}>Date:</td>
              <td style={infoValue}>
                {new Date(viewingDate).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </td>
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

      {/* Action Buttons */}
      <Section style={buttonSection}>
        <Button href={calendarLink} style={calendarButton}>
          Add to Calendar
        </Button>
        <Button href={directionsLink} style={directionsButton}>
          Get Directions
        </Button>
      </Section>

      <Hr style={hr} />

      {/* Viewing Tips */}
      <Section style={tipsBox}>
        <Heading as="h3" style={tipsHeading}>
          Viewing Tips
        </Heading>
        <Text style={tipText}>
          <EmailIcon name="check" color="#10b981" size={16} />
          Arrive 5 minutes early
        </Text>
        <Text style={tipText}>
          <EmailIcon name="check" color="#10b981" size={16} />
          Bring a list of questions
        </Text>
        <Text style={tipText}>
          <EmailIcon name="check" color="#10b981" size={16} />
          Take photos/notes if permitted
        </Text>
        <Text style={tipText}>
          <EmailIcon name="check" color="#10b981" size={16} />
          Check all rooms and amenities
        </Text>
      </Section>

      <Section style={dashboardSection}>
        <Button href={dashboardLink} style={dashboardButton}>
          View My Dashboard
        </Button>
      </Section>
    </EmailLayout>
  );
}

// Styles matching ACE Investment Properties brand
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
  backgroundColor: '#ffffff',
  border: '2px solid #e5e7eb',
  borderRadius: '0',
  padding: '24px',
  marginBottom: '24px',
};

const propertyImageStyle = {
  width: '100%',
  height: 'auto',
  borderRadius: '0',
  marginBottom: '16px',
};

const propertyTitleStyle = {
  color: '#1f2937',
  fontSize: '24px',
  fontFamily: '"Playfair Display", Georgia, serif',
  fontWeight: '500',
  margin: '0 0 8px 0',
};

const propertyAddressStyle = {
  color: '#6b7280',
  fontSize: '14px',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
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

const buttonSection = {
  textAlign: 'center',
  margin: '32px 0',
};

const calendarButton = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '0',
  textDecoration: 'none',
  fontWeight: 'bold',
  display: 'inline-block',
  margin: '0 8px 12px 8px',
};

const directionsButton = {
  backgroundColor: '#1a1a2e',
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

const tipsBox = {
  backgroundColor: '#f8f9fa',
  borderLeft: '4px solid #10b981',
  borderRadius: '0',
  padding: '24px',
  marginBottom: '24px',
};

const tipsHeading = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px 0',
};

const tipText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '8px 0',
  lineHeight: '22px',
  display: 'flex',
  alignItems: 'center',
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
